import minimist from 'minimist';
import { pipe } from 'ramda';
import { WebSocket } from 'ws';
import { createRequire } from 'module';
import { createLogger, format, transports } from 'winston';
import ora from 'ora';
import { execSync } from 'child_process';
import pty from 'node-pty';
import 'readline';
import Conf from 'conf';
import dotenv from 'dotenv';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { combine, printf } = format;
const logFormat = printf(({ level, message, stack }) => {
    return `[${level}]: ${stack || message}`;
});
const logger = createLogger({
    level: "info",
    silent: false,
    format: combine(format.errors({ stack: true }), format.colorize({ all: true }), logFormat),
    transports: [
        new transports.Console({
            level: "info",
            format: format.colorize({ all: true }),
        }),
        new transports.File({ filename: "combined.log" }),
    ],
});
//CORRECT USAGE:  https://github.com/sindresorhus/ora/blob/main/example.js
//PR: https://github.com/sindresorhus/ora/pull/112
//ISSUE: https://github.com/sindresorhus/ora/issues/97
ora({ discardStdin: false });

class Terminal {
    _pty;
    history = [];
    name;
    onoutput;
    onclose;
    constructor({ name }) {
        this.name = name;
        this.sanitizeCommandResult = this.sanitizeCommandResult.bind(this);
        this.write = this.write.bind(this);
    }
    //https://github.com/microsoft/node-pty/issues/429
    // Function to clear input echo
    sanitizeCommandResult(cmdStr) {
        /*
          Docker output always contains user cli line AFTER the input echo
          Example:
            pwd
            /
            ]0;root@a52a3c0eaa27: /root@a52a3c0eaa27:/#
          This is sometimes sent separately or even *along with the output*
          So, we can't discard the entire line as it might contain the actual output too
          Hence, removing the FIRST occurrence of the last command from the output
          (along with any carriage returns)
        */
        let _1 = cmdStr;
        let _2 = [...this.history].pop()?.data.trim();
        if (_2) {
            // Remove last command from the beginning
            if (_1.indexOf(_2) === 0) {
                _1 = _1.replace(_2, "");
                cmdStr = cmdStr.replace(_2, "");
            }
            // Remove any combination of carriage returns from the beginning
            if (_1.indexOf("\r\n") === 0) {
                _1 = _1.replace("\r\n", "");
            }
            if (_1.indexOf("\r") === 0) {
                _1 = _1.replace("\r", "");
            }
            if (_1.indexOf("\n") === 0) {
                _1 = _1.replace("\n", "");
            }
        }
        return _1;
    }
    write(data) {
        this.history.push(data);
        if (data.type === "CREATE_CONTAINER") {
            logger.error("gon delete ma shizz:" + JSON.stringify(data));
            execSync(`docker rm -f ${this.name}`);
            logger.error("don delete ma shizz:" + JSON.stringify(data));
            const image = data.data;
            this._pty = pty.spawn("docker", ["run", "-it", "--privileged", "--name=" + this.name, image, "bash"], {});
            this._pty?.onData((cmdStr) => {
                cmdStr = this.sanitizeCommandResult(cmdStr);
                const commandResult = {
                    type: "RSLT",
                    data: cmdStr,
                };
                this.onoutput(commandResult);
            });
            this._pty?.onExit(this.onclose);
            return;
        }
        else if (data.type === "CMD") {
            logger.error("Whoahh a command!" + JSON.stringify(data));
            this._pty && this._pty.write(data.data);
        }
    }
}

dotenv.config();
//////////////////////////////////
// Global config
//////////////////////////////////
process.env.DEFAULT_MAX_CPU || "50";
process.env.DEFAULT_MAX_MEMORY || "25";
process.env.DEFAULT_MAX_DISK || "1G";
process.env.DEFAULT_DAEMON_PORT || "8080";
dirname(fileURLToPath(import.meta.url));
const CONTAINER_PREFIX = "vt__";
// export const CENTRAL_SERVER = process.env.CENTRAL_SERVER || "34.133.251.43:8080"
const CENTRAL_SERVER = process.env.CENTRAL_SERVER || "localhost:8080";
const SIGNALING_SERVER = `ws://${CENTRAL_SERVER}`;
//////////////////////////////////
// Persisted config
//////////////////////////////////
new Conf({ projectName: "vt100-cli" });

const require = createRequire(import.meta.url);
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, } = require("wrtc");
const defaultConfig = {
    signalingServer: "ws://localhost:8080",
    iceServer: "stun:stun.l.google.com:19302",
    roomName: "lorem",
    //default is trickle=true unless specified otherwise
    trickle: process.env["TRICKLE"]
        ? process.env["TRICKLE"].toLowerCase() === "true"
        : true,
};
class Peer {
    Q = [];
    connections = [];
    peerConnections = {};
    dataChannels = {};
    callbacks = {};
    socket = null;
    config;
    whoAmI = "";
    _ = {};
    constructor(config) {
        this.config = {
            ...defaultConfig,
            ...config,
        };
        logger.debug("TRICKLE mode=" + this.config.trickle);
        this.register = this.register.bind(this);
        this.fire = this.fire.bind(this);
        this.on = this.on.bind(this);
        this.handleCommandsFromCentralServer =
            this.handleCommandsFromCentralServer.bind(this);
        this.getSocketIdForPeerConnection =
            this.getSocketIdForPeerConnection.bind(this);
        try {
            this.socket = new WebSocket(config.signalingServer);
        }
        catch (err) {
            logger.error(err);
        }
        if (this.socket) {
            pipe(this.handleError, this.handleClose, this.handleCommandsFromCentralServer)(this.socket);
            this.socket.onopen = () => {
                this.register(this.socket);
            };
            this.on("remove_peer_connected", ({ data }) => {
                if (data && data.socketId)
                    delete this.peerConnections[data.socketId];
            });
        }
    }
    //category: interfacing with centralserver
    fire(commandName, ...args) {
        (this.callbacks[commandName] || []).map((cb) => cb(...args));
    }
    //category: interfacing with centralserver
    on(commandName, callback) {
        this.callbacks[commandName] = this.callbacks[commandName] || [];
        this.callbacks[commandName].push(callback);
    }
    //category:util
    register(socket) {
        socket &&
            socket.send(JSON.stringify({
                eventName: "join_room",
                data: {
                    room: this.config.roomName,
                },
            }));
        return socket;
    }
    //category:util
    handleError(socket) {
        if (socket)
            socket.onerror = (err) => {
                logger.error(err);
                console.error("Failed to connect to socket. Check channel server configuration");
                process.exit(1);
            };
        return socket;
    }
    //category:util
    handleClose = (socket) => {
        if (socket)
            socket.onclose = () => {
                //TODO: destructor and cleanup
                logger.warn("Socket closed, Peer killed. I will no longer listen to any commands or REST API calls");
                console.error("Socket server closed connection.");
                process.exit(1);
            };
        return socket;
    };
    //category:util
    getSocketIdForPeerConnection(peerConnection) {
        for (let socketId in this.peerConnections)
            if (peerConnection === this.peerConnections[socketId])
                return socketId;
        logger.error("SocketID not found for given peerConnection. Seems like you messed up.");
        process.exit(1);
    }
    //category:util
    getSocketIdForDataChannel(dataChannel) {
        for (let socketId in this.dataChannels)
            if (dataChannel === this.dataChannels[socketId])
                return socketId;
        logger.error("SocketID not found for given dataChannel. Seems like you messed up.");
        process.exit(1);
    }
    handleCommandsFromCentralServer(socket) {
        if (socket)
            socket.onmessage = ({ data }) => {
                data = JSON.parse(data);
                this.fire(data.eventName, data.data);
            };
    }
    sendMessageToCentralServer(msg) {
        if (this.socket && this.socket.readyState == this.socket.OPEN) {
            this.socket.send(JSON.stringify(msg));
            logger.silly(`Sending MSG to central server:${JSON.stringify(msg)}`);
        }
    }
    relayMessageThroughCentralServer(msg) {
        this.sendMessageToCentralServer(msg); //L.O.L
    }
}
class RTCPeer extends Peer {
    peerHandle = null;
    constructor(config) {
        super(config);
        this.on("receive_ice_candidate", (data) => {
            this.onReceiveIceCandidate(data.socketId, data.candidate);
        });
        this.peerConnectionOnIceCandidate =
            this.peerConnectionOnIceCandidate.bind(this);
        this.createPeerHandle = this.createPeerHandle.bind(this);
        this.dataChannelOnMessage = this.dataChannelOnMessage.bind(this);
        this.dataChannelOnOpen = this.dataChannelOnOpen.bind(this);
        this.dataChannelOnClose = this.dataChannelOnClose.bind(this);
        this.onReceiveIceCandidate = this.onReceiveIceCandidate.bind(this);
        this.peerConnectionOnDataChannel =
            this.peerConnectionOnDataChannel.bind(this);
    }
    send(jsonStringified) {
        if (!this.peerHandle ||
            !this.peerHandle.dataChannel ||
            this.peerHandle.dataChannel.readyState !== "open") {
            logger.debug(`DataChannel not yet ready. Unable to send msg: ${jsonStringified}`);
        }
        else {
            this.peerHandle.dataChannel.send(jsonStringified);
        }
    }
    set onmessage(callback) {
        if (!this.peerHandle || !this.peerHandle.dataChannel) {
            this._["onmessage"] = callback;
            logger.silly("Not attaching onmessage handler right away..");
        }
        else {
            this.peerHandle.dataChannel.onmessage = ({ data }) => {
                if (data)
                    callback(data);
            };
            logger.silly("Attached onmessage handler");
        }
    }
    createPeerHandle(socketId) {
        const peerConnection = this.createRTCPeerConnection(socketId, this._["isDonor"]);
        return { socketId, peerConnection };
    }
    onReceiveIceCandidate(socketId, candidate) {
        if (!this.peerConnections[socketId]) {
            logger.error("You fucked up the flow. Gon kill myself. Bye...");
            process.exit(1);
        }
        const rtcIceCandidate = new RTCIceCandidate(candidate);
        const pc = this.peerConnections[socketId];
        if (pc.remoteDescription)
            pc.addIceCandidate(rtcIceCandidate);
        else
            this.Q.push(rtcIceCandidate);
    }
    sendIceCandidate(socketId, candidate) {
        this.relayMessageThroughCentralServer({
            eventName: "send_ice_candidate",
            data: {
                label: this.config.roomName,
                candidate,
                socketId,
            },
        });
    }
    sendSdp(socketId) {
        if (!this.peerHandle) {
            logger.error("Incorrect State. Cannot send SDP because peerHandle=null. Exiting...");
            process.exit(1);
        }
        this.relayMessageThroughCentralServer({
            eventName: this._["isDonor"] ? "send_offer" : "send_answer",
            data: {
                socketId,
                sdp: this.peerHandle.peerConnection.localDescription,
            },
        });
    }
    sendOffer(socketId) {
        this.sendSdp(socketId);
    }
    sendAnswer(socketId) {
        this.sendSdp(socketId);
    }
    createRTCPeerConnection(socketId, isDonor) {
        if (socketId in this.peerConnections) {
            logger.debug("RTCPeerConnection already exists for socketID:" + socketId);
            return;
        }
        const donorConnection = [
            {
                urls: `${this.config.iceServer}`,
            },
            {
                urls: "turn:numb.viagenie.ca",
                username: "dhirajbhakta110@gmail.com",
                credential: "6UM588cb3ZTRfsn",
            },
        ];
        const doneeConnection = [
            {
                urls: `${this.config.iceServer}`,
            },
        ];
        const pc = (this.peerConnections[socketId] = new RTCPeerConnection({
            iceServers: isDonor ? donorConnection : doneeConnection,
        }));
        pipe(this.peerConnectionOnDataChannel, this.peerConnectionOnIceCandidate)(pc);
        return pc;
    }
    createDataChannel(socketId) {
        if (socketId in this.dataChannels) {
            logger.debug("DataChannel already exists for socketID:" + socketId);
            return;
        }
        const pc = this.peerConnections[socketId];
        if (!pc) {
            logger.error("RTCPeerConnection not found for socketID:" + socketId);
            process.exit(1);
        }
        const dc = (this.dataChannels[socketId] = pc.createDataChannel("whatevs"));
        pipe(this.dataChannelOnOpen, this.dataChannelOnClose, this.dataChannelOnError, this.dataChannelOnMessage)(dc);
        return dc;
    }
    peerConnectionOnDataChannel(peerConnection) {
        peerConnection.ondatachannel = ({ channel }) => {
            const socketId = this.getSocketIdForPeerConnection(peerConnection);
            pipe(this.dataChannelOnOpen, this.dataChannelOnClose, this.dataChannelOnError, this.dataChannelOnMessage)(channel);
            this.dataChannels[socketId] = channel;
            if (!this.peerHandle) {
                this.peerHandle = {
                    socketId,
                    dataChannel: channel,
                    peerConnection,
                };
            }
            this.peerHandle.dataChannel = channel;
        };
        return peerConnection;
    }
    peerConnectionOnIceCandidate(peerConnection) {
        const socketId = this.getSocketIdForPeerConnection(peerConnection);
        peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate)
                this.sendIceCandidate(socketId, candidate);
            else {
                if (!this.config.trickle) {
                    if (peerConnection !== this.peerHandle?.peerConnection)
                        logger.error("You fucked up big time. This can happen only in non trickle(slow) mode .Exiting...");
                    this.sendSdp(socketId);
                }
            }
        };
        return peerConnection;
    }
    dataChannelOnOpen(dataChannel) {
        dataChannel.onopen = () => {
            this.fire("connection_established");
        };
        return dataChannel;
    }
    dataChannelOnClose(dataChannel) {
        dataChannel.onclose = () => logger.warn("DataChannel closed");
        return dataChannel;
    }
    dataChannelOnMessage(dataChannel) {
        dataChannel.onmessage = ({ data }) => {
            logger.info(`DataChannel recv msg:${data}`);
            if (data)
                this.fire("recv", data);
        };
        if (typeof this._["onmessage"] === "function") {
            dataChannel.onmessage = ({ data }) => {
                if (data) {
                    this.fire("recv", data);
                    this._["onmessage"](data);
                }
            };
            logger.silly("Finally attached onmessage handler!");
        }
        return dataChannel;
    }
    dataChannelOnError(dataChannel) {
        dataChannel.onerror = (err) => logger.error(`DataChannel error:${err.toString()}`);
        return dataChannel;
    }
}
class RTCDonorPeer extends RTCPeer {
    count = 0;
    terminal;
    constructor(config) {
        super(config);
        this._["isDonor"] = true;
        this.terminal = new Terminal({
            name: CONTAINER_PREFIX + config.roomName,
        });
        this.on("new_peer_connected", async (data) => {
            this.peerHandle = this.createPeerHandle(data.socketId);
            this.peerHandle.dataChannel = this.createDataChannel(data.socketId);
            const offer = await this.peerHandle.peerConnection.createOffer();
            await this.peerHandle.peerConnection.setLocalDescription(offer);
            if (this.config.trickle)
                this.sendOffer(data.socketId);
        });
        this.on("receive_answer", async (data) => {
            this.receiveAnswer(data.socketId, data.sdp);
        });
        this.onmessage = (message) => {
            const command = JSON.parse(message);
            this.terminal.write(command);
        };
        this.terminal.onoutput = (commandResult) => {
            this.send(JSON.stringify(commandResult));
        };
        this.on("connection_established", () => {
            logger.info("Peer connected!, connection established!,");
        });
        this.receiveAnswer = this.receiveAnswer.bind(this);
    }
    async receiveAnswer(socketId, answer) {
        if (!this.peerConnections[socketId]) {
            logger.error("Cannot recieve answer as peerConnection not found for socketID:" +
                socketId);
            process.exit(1);
        }
        const pc = this.peerConnections[socketId];
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
        catch (err) {
            logger.error(err);
        }
        while (this.Q.length > 0)
            pc.addIceCandidate(this.Q.shift());
    }
}

/**
 * This "Daemon" script runs only on the donor side
 */
const argv = minimist(process.argv.slice(2));
///////// RescourceLimits Not Implemented//////
// const MAX_CPU = argv["max-cpu"]
// const MAX_MEMORY = argv["max-memory"]
// const MAX_DISK = argv["max-disk"]
const ROOM_NAME = argv["room-name"];
//constructor does all the job
new RTCDonorPeer({
    roomName: ROOM_NAME,
    signalingServer: SIGNALING_SERVER,
});
