import minimist from "minimist";
import { RTCDonorPeer } from "../utils/webrtc.js";
import { SIGNALING_SERVER } from "../config.js";
/**
 * This "Daemon" script runs only on the donor side
 */
const argv = minimist(process.argv.slice(2));

///////// RescourceLimits Not Implemented//////
// const MAX_CPU = argv["max-cpu"]
// const MAX_MEMORY = argv["max-memory"]
// const MAX_DISK = argv["max-disk"]
const ROOM_NAME = argv["room-name"]

//constructor does all the job
const peer = new RTCDonorPeer({
    roomName: ROOM_NAME,
    signalingServer: SIGNALING_SERVER,
});
