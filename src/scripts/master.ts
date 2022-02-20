import minimist from "minimist";
import logger from "../utils/log.js";
import { Terminal } from "../utils/pty.js";
import { RTCDonorPeer } from "../utils/webrtc.js";
import { CONTAINER_PREFIX, SIGNALING_SERVER } from "../config.js";
import pty, { IPty } from "node-pty";
/**
 * This "Daemon" script runs only on the donor side
 */
const argv = minimist(process.argv.slice(2));

///////// RescourceLimits Not Implemented//////
// const MAX_CPU = argv["max-cpu"]
// const MAX_MEMORY = argv["max-memory"]
// const MAX_DISK = argv["max-disk"]
const ROOM_NAME = argv["room-name"]

const peer = new RTCDonorPeer({
    roomName: ROOM_NAME,
    signalingServer: SIGNALING_SERVER,
});

let containerCreated = false;


const restartContainer = async (dockerRestartCommand: string) => {
    return new Promise<void>((resolve) => {
        const tempProcess = pty.spawn("docker", dockerRestartCommand.split(" ").slice(1), {});
        tempProcess.onExit(() => {
            resolve()
        })
    })
}


peer.on("connection_established", () => {
    let dockerPtyTerminal: Terminal | null = null;
    peer.onmessage = async (message: string) => {
        const messageObj = JSON.parse(message);
        
        if (messageObj.eventName == "create_container") {
            const memoryLimit = "1g"
            const cpus = "1.0"
            const cpuShares = "1024"
            const image = messageObj.data.image
            const name = `${CONTAINER_PREFIX}_${ROOM_NAME}`
            const shell = "bash"
            const dockerExecCommand = `docker exec -it ${name} ${shell}`
            const dockerRunCommand = `docker run -it --privileged=true --name=${name} --memory=${memoryLimit} --cpus=${cpus} --cpu-shares=${cpuShares} ${image} ${shell}`
            const dockerRestartCommand = `docker restart ${name}`
            
            let ptyProcess:IPty;
            if(containerCreated) {
                await restartContainer(dockerRestartCommand)
                ptyProcess = pty.spawn("docker", dockerExecCommand.split(" ").slice(1), {});
            } else {
                ptyProcess = pty.spawn("docker", dockerRunCommand.split(" ").slice(1), {});
                containerCreated = true;
            }
            
            dockerPtyTerminal = new Terminal({ ptyProcess: ptyProcess });
            
            // Listeners
            dockerPtyTerminal.onoutput = (commandResult) => {
                peer.send(JSON.stringify(commandResult));
            };
        }

        if (messageObj.eventName == "command") {
            const commandJSON = messageObj.data; 
            if(dockerPtyTerminal) {
                dockerPtyTerminal.write(commandJSON);
            }
        }
    };

});
