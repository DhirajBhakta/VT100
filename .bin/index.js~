#!/usr/bin/env node
import { Command, Option, InvalidArgumentError } from 'commander';
import figlet from 'figlet';
import { green, bold, red, magenta, magentaBright, yellow, blackBright } from 'colorette';
import Conf from 'conf';
import dotenv from 'dotenv';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect as connect$2 } from 'net';
import inquirer from 'inquirer';
import { pipe, either, andThen } from 'ramda';
import { promisify } from 'node:util';
import pkg from 'pm2';
import { createLogger, format, transports } from 'winston';
import ora from 'ora';
import fetch from 'isomorphic-fetch';
import readline from 'readline';
import require$$0, { WebSocket } from 'ws';
import { createRequire } from 'module';
import express from 'express';
import http from 'http';

/**
 *This is a  drop-in replacement of the utils.promisify from the
 * standard `utils` package which works for all functions that have N-arity
 * except for nullaries :/
 * @param functionThatTakesCallback
 * @returns functionThatGivesAPromise
 */
function promisifyNullary(functionThatTakesCallback) {
    return function () {
        return new Promise((res, rej) => {
            functionThatTakesCallback(rej);
        });
    };
}
function ping(host = 'localhost', port = 8080) {
    try {
        connect$2(port, host);
        return true;
    }
    catch {
        return false;
    }
}

dotenv.config();
//////////////////////////////////
// Global config
//////////////////////////////////
const DEFAULT_MAX_CPU = process.env.DEFAULT_MAX_CPU || "50";
const DEFAULT_MAX_MEMORY = process.env.DEFAULT_MAX_MEMORY || "25";
const DEFAULT_MAX_DISK = process.env.DEFAULT_MAX_DISK || "1G";
process.env.DEFAULT_DAEMON_PORT || "8080";
const pwd = dirname(fileURLToPath(import.meta.url));
const DAEMON_CONFIG = {
    master: {
        name: "rh-master",
        absolutePathToScript: `${pwd}/scripts/master.js`,
        // absolutePathToScript: `${pwd}/scripts/master.js`,
    },
    metrics: {
        name: "rh-metrics",
        absolutePathToScript: `${pwd}/scripts/metrics.js`,
        // absolutePathToScript: `${pwd}/scripts/metrics.js`,
    },
};
const SUPPORTED_IMAGES = ["ubuntu", "debian", "fedora"];
// export const CENTRAL_SERVER = process.env.CENTRAL_SERVER || "34.133.251.43:8080"
const CENTRAL_SERVER = process.env.CENTRAL_SERVER || ping()
    ? "localhost:8080"
    : "34.133.251.43:8080";
const SIGNALING_SERVER = `ws://${CENTRAL_SERVER}`;
// endpoints on signalingserver
const IS_SIGNALING_SERVER_UP = `http://${CENTRAL_SERVER}/metrics/available`;
const LIST_DONORS_ENDPOINT = `http://${CENTRAL_SERVER}/metrics/available`;
const DONOR_HEARTBEAT_ENDPOINT = (roomName) => `http://${CENTRAL_SERVER}/metrics/${roomName}`;
const RANDOM_ANIME_QUOTES = "https://animechan.vercel.app/api/random";
//////////////////////////////////
// Persisted config
//////////////////////////////////
const persistedConfig = new Conf({ projectName: "vt100-cli" });
const getAuthToken = (email) => {
    return persistedConfig.get(`tokens.${email}`);
};
// Donor preferences
const setDonorPreferences = (maxCpu, maxMemory, maxDisk) => {
    persistedConfig.set(`preferences.maxCpu`, maxCpu);
    persistedConfig.set(`preferences.maxMemory`, maxMemory);
    persistedConfig.set(`preferences.maxDisk`, maxDisk);
};
const getDonorPreferences = () => {
    const maxCpu = persistedConfig.get(`preferences.maxCpu`);
    const maxMemory = persistedConfig.get(`preferences.maxMemory`);
    const maxDisk = persistedConfig.get(`preferences.maxDisk`);
    return { maxCpu, maxMemory, maxDisk };
};
// Consumer preferences
const setConsumerPreferences = (image) => {
    persistedConfig.set(`preferences.image`, image);
};
const getConsumerPreferences = () => {
    const image = persistedConfig.get(`preferences.image`);
    return { image };
};
const MAX_CONTAINER_METRICS_TO_STORE = 10;
class Store {
    _store = {};
    set = (metricReq) => {
        const existingMetric = this._store[metricReq.roomName];
        let containerHistory = existingMetric
            ? [
                ...existingMetric.containerHistory,
                ...Object.values(metricReq.containers || []),
            ]
            : [...Object.values(metricReq.containers || [])];
        if (containerHistory.length > MAX_CONTAINER_METRICS_TO_STORE) {
            containerHistory.splice(MAX_CONTAINER_METRICS_TO_STORE, containerHistory.length - MAX_CONTAINER_METRICS_TO_STORE);
        }
        let metric = {
            ...metricReq,
            containerHistory: containerHistory,
            lastUpdated: new Date().toISOString(),
        };
        this._store[metric.roomName] = metric;
        return true;
    };
    get = (roomName) => {
        return this._store[roomName];
    };
    list = () => {
        return Object.values(this._store);
    };
}
const metricStore = new Store();
const adjectives = [
    "autumn",
    "hidden",
    "bitter",
    "misty",
    "silent",
    "empty",
    "dry",
    "dark",
    "summer",
    "icy",
    "delicate",
    "quiet",
    "white",
    "cool",
    "spring",
    "winter",
    "patient",
    "twilight",
    "dawn",
    "crimson",
    "wispy",
    "weathered",
    "blue",
    "billowing",
    "broken",
    "cold",
    "damp",
    "falling",
    "frosty",
    "green",
    "long",
    "late",
    "lingering",
    "bold",
    "little",
    "morning",
    "muddy",
    "old",
    "red",
    "rough",
    "still",
    "small",
    "sparkling",
    "wandering",
    "withered",
    "wild",
    "black",
    "young",
    "holy",
    "solitary",
    "fragrant",
    "aged",
    "snowy",
    "proud",
    "floral",
    "restless",
    "divine",
    "polished",
    "ancient",
    "purple",
    "lively",
    "nameless",
];
const nouns = [
    "waterfall",
    "river",
    "breeze",
    "moon",
    "rain",
    "wind",
    "sea",
    "morning",
    "snow",
    "lake",
    "sunset",
    "pine",
    "shadow",
    "leaf",
    "dawn",
    "glitter",
    "forest",
    "hill",
    "cloud",
    "meadow",
    "sun",
    "glade",
    "bird",
    "brook",
    "butterfly",
    "bush",
    "dew",
    "dust",
    "field",
    "fire",
    "flower",
    "firefly",
    "feather",
    "grass",
    "haze",
    "mountain",
    "night",
    "pond",
    "darkness",
    "snowflake",
    "silence",
    "sound",
    "sky",
    "shape",
    "surf",
    "thunder",
    "violet",
    "water",
    "wildflower",
    "wave",
    "water",
    "resonance",
    "sun",
    "wood",
    "dream",
    "cherry",
    "tree",
    "fog",
    "frost",
    "voice",
    "paper",
    "frog",
    "smoke",
    "star",
];
const generateName = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}_${noun}`;
};

const loginUser = (email) => {
    const token = getAuthToken(email);
    if (!token) ;
    else {
        console.log(green("Login successful for: " + bold(email)));
    }
};

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
// export const devLogger = createLogger({
//   level: "silly",
//   silent: false, //set this to true later
//   format: combine(
//     format.errors({ stack: true }),
//     format.colorize({ all: true }),
//     logFormat
//   ),
//   transports: [new transports.Console()],
// });
const catchAllBrokerDeathWrapper = (commanderAction) => async (...args) => {
    try {
        return await commanderAction(args);
    }
    catch (error) {
        logger.error("Broker is possibly dead. Contact the monkees that built vt100");
        process.exit(1);
    }
};
//CORRECT USAGE:  https://github.com/sindresorhus/ora/blob/main/example.js
//PR: https://github.com/sindresorhus/ora/pull/112
//ISSUE: https://github.com/sindresorhus/ora/issues/97
const Spinner = ora({ discardStdin: false });

const { killDaemon: k, connect: c, disconnect: dc, start: s, restart: r, stop: st, delete: d, list: l, } = pkg;
const [killDaemon, connect$1, disconnect, start, restart, stop, deleteP, list] = [
    k,
    c,
    dc,
    s,
    r,
    st,
    d,
    l,
].map((fn) => fn.bind(pkg));
////////////// lookup maps & helpers ///////////////
const PM2 = {
    kill: promisifyNullary(killDaemon),
    connect: promisify(connect$1),
    disconnect: promisify(disconnect),
    start: promisify(start),
    restart: promisify(restart),
    stop: promisify(stop),
    delete: promisify(deleteP),
    list: promisify(list),
};
const presentParticiple = (verb) => verb.endsWith("e") ? verb.slice(0, -1) + "ing" : verb + "ing";
/////////////////////////////////////////////////////
////----------The Pipe-------------------/////////////
const StartSpinner_Execute_StopSpinner = (monad) => pipe(startSpinner, execute, stopSpinner)(monad)[2];
/////////////////////////////////////////////////////
////----Parts that make up the pipe------/////////////
const startSpinner = function ([processName, verb, __]) {
    Spinner.start(`${presentParticiple(verb)} ${processName} process...`);
    return [processName, verb, __];
};
const execute = ([processName, verb, args]) => [processName, verb, PM2[verb](args)];
const stopSpinner = function ([processName, verb, resultPromise]) {
    Spinner.stop();
    return [processName, verb, resultPromise];
};
////////////////////////////////////////////////////
var pm2 = {
    kill: PM2.kill,
    detach: PM2.disconnect,
    connect: (processName) => StartSpinner_Execute_StopSpinner([processName, "connect", undefined]),
    start: (opts) => StartSpinner_Execute_StopSpinner([opts.name, "start", opts]),
    restart: (processName) => StartSpinner_Execute_StopSpinner([processName, "restart", undefined]),
    stop: (processName) => StartSpinner_Execute_StopSpinner([processName, "stop", undefined]),
    delete: (processName) => StartSpinner_Execute_StopSpinner([processName, "delete", undefined]),
    list: PM2.list,
    isOnline: (pd) => pd && pd.pm2_env && pd.pm2_env.status === "online",
};
//handle room name here somehow from daemon.ts

const initializeDaemonsAndDetach = async (maxCpu, maxMemory, maxDisk) => {
    ////////statping signaling server ////////////////////
    await fetch(IS_SIGNALING_SERVER_UP, { method: 'HEAD' });
    if (await isAnyDaemonRunning()) {
        logger.error("Daemon already running. Please kill existing daemon using `rh kill` command.");
        process.exit(1);
    }
    try {
        const answers = await inquirer.prompt([
            !maxCpu && {
                type: "input",
                name: "maxCpu",
                message: "How much CPU do you wish to allocate?",
                default: getDonorPreferences().savedMaxCpu || DEFAULT_MAX_CPU,
                validate(value) {
                    const valid = !isNaN(parseFloat(value)) && value > 0 && value < 100;
                    return (valid || "Please enter a number between 0 and 100 (non-inclusive)");
                },
            },
            !maxMemory && {
                type: "input",
                name: "maxMemory",
                message: "How much memory do you wish to allocate?",
                default: getDonorPreferences().savedMaxMemory || DEFAULT_MAX_MEMORY,
                validate(value) {
                    const valid = !isNaN(parseFloat(value)) && value > 0 && value < 100;
                    return (valid || "Please enter a number between 0 and 100 (non-inclusive)");
                },
            },
            !maxDisk && {
                type: "input",
                name: "maxDisk",
                message: "How much disk do you wish to allocate?",
                default: getDonorPreferences().savedMaxDisk || DEFAULT_MAX_DISK,
            },
        ].filter(Boolean));
        setDonorPreferences(maxCpu || answers.maxCpu, maxMemory || answers.maxMemory, maxDisk || answers.maxDisk);
    }
    catch {
        console.log(red("Prompt couldn't be rendered in the current environment"));
        process.exit(1);
    }
    await startBothDaemons();
    pm2.detach();
};
const startBothDaemons = async () => {
    const newRoomName = generateName();
    console.log(magenta("Creating room:" + newRoomName));
    await Promise.all([
        pm2.start({
            script: "node",
            name: DAEMON_CONFIG.master.name,
            args: [
                DAEMON_CONFIG.master.absolutePathToScript,
                "--max-cpu",
                getDonorPreferences().maxCpu,
                "--max-memory",
                getDonorPreferences().maxMemory,
                "--max-disk",
                getDonorPreferences().maxDisk,
                "--room-name",
                newRoomName,
            ],
            max_restarts: 1,
        }),
        pm2.start({
            script: "node",
            name: DAEMON_CONFIG.metrics.name,
            args: [
                DAEMON_CONFIG.metrics.absolutePathToScript,
                "--max-cpu",
                getDonorPreferences().maxCpu,
                "--max-memory",
                getDonorPreferences().maxMemory,
                "--max-disk",
                getDonorPreferences().maxDisk,
                "--room-name",
                newRoomName,
            ],
            cron: "*/5 * * * * *",
        }),
    ]);
};
////////////Not used/////////////////
const isAnyDaemonRunning = async () => (await pm2.list())
    .filter(either(isDaemon, isDaemonMetrics))
    .some(pm2.isOnline);
const isDaemon = (pd) => pd.name === DAEMON_CONFIG.master.name;
const isDaemonMetrics = (pd) => pd.name === DAEMON_CONFIG.metrics.name;
const DonorActions = {
    init: initializeDaemonsAndDetach,
    kill: pm2.kill
};

// https://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings/29497680
const clearANSIFormatting = (str) => {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
};
class PseudoTerminal {
    history = [];
    rl;
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
        });
    }
    onType(onInput) {
        this.rl.on("line", (line) => {
            const command = {
                type: "CMD",
                data: line + "\n",
            };
            onInput(command);
            this.history.push(command);
        });
    }
    print(result) {
        process.stdout.write(result.data);
    }
}

const require = createRequire(import.meta.url);
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');
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
class RTCDoneePeer extends RTCPeer {
    constructor(config) {
        super(config);
        this._["isDonor"] = false;
        this.on("receive_offer", async (data) => {
            await this.receiveOffer(data.socketId, data.sdp);
            const answer = await this.peerHandle?.peerConnection.createAnswer();
            await this.peerHandle?.peerConnection.setLocalDescription(answer);
            if (this.config.trickle)
                this.sendAnswer(data.socketId);
        });
        this.on("get_peers", (data) => {
            if (data.connections.length > 1) {
                logger.error("Looks like someone else joined the room. Only Donor and me(Donee) were supposed to be there. Exiting...");
                console.error("Looks like someone else is already connected to the peer. Exiting...");
                process.exit(1);
            }
            if (data.connections.length === 1) {
                this.peerHandle = this.createPeerHandle(data.connections[0]);
                //no datachannel YET
            }
            else {
                logger.silly(`Ignore this event. connections=0. connections=${data.connections.length}`);
            }
        });
    }
    async receiveOffer(socketId, offer) {
        if (!this.peerConnections[socketId]) {
            logger.error("Cannot receive offer as peerConnection not found for socketID:" +
                socketId);
            process.exit(1);
        }
        const pc = this.peerConnections[socketId];
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        while (this.Q.length > 0)
            pc.addIceCandidate(this.Q.shift());
    }
}

const listRooms = async () => {
    Spinner.start(`Fetching list of avaiable donors...`);
    const response = await fetch(LIST_DONORS_ENDPOINT);
    Spinner.stop();
    if (response.status !== 200) {
        logger.error("List Donors API call failure");
        console.log(red("Could not establish connection. Please try again later"));
        process.exit(1);
    }
    const roomsMeta = (await response.json()).metrics;
    if (!roomsMeta.length) {
        logger.error("No resources available ...onboard someone to vt100 :P");
        process.exit(1);
    }
    return roomsMeta;
};
const chooseFromAvailableRooms = async (roomsMeta) => {
    const SEPARATOR = "∘";
    const donorSelectionList = roomsMeta.map((donor) => {
        const timeDiff = Math.round((new Date().getTime() - new Date(donor.lastUpdated).getTime()) / 1000);
        const specs = `${bold(donor.roomName)} \n  CPU: ${donor.availableCpu} ${SEPARATOR} Memory: ${donor.availableMemory} ${SEPARATOR} Disk: ${donor.availableDisk} ${SEPARATOR} Udated ${timeDiff} seconds ago \n`;
        return { name: specs, value: donor.roomName };
    });
    try {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "roomName",
                message: "Here is a list of available donors. Select one to connect.",
                choices: donorSelectionList,
            },
        ]);
        return answer.roomName;
    }
    catch (err) {
        console.log(red("Prompt couldn't be rendered in the current environment"));
        process.exit(1);
    }
};
const checkRoomAvailability = async (roomName) => {
    Spinner.start(`Verifying '${roomName}'...`);
    const response = await fetch(DONOR_HEARTBEAT_ENDPOINT(roomName));
    Spinner.stop();
    if (response.status !== 200) {
        console.log(red("Donor not available. Try checking for avaiable donors using `rh list`."));
        process.exit(1);
    }
    return roomName;
};
const obtainImageName = async (roomName) => {
    try {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "image",
                message: "Choose an OS to run remotely: ",
                choices: SUPPORTED_IMAGES,
                default: getConsumerPreferences().image,
            },
        ]);
        setConsumerPreferences(answer.image);
        console.log(green(`\nPreparing to provision: ${bold(answer.image)}`));
        return [roomName, answer.image];
    }
    catch (error) {
        console.log(red("Prompt couldn't be rendered in the current environment"));
        process.exit(1);
    }
};
const connect = async (roomName, image) => {
    Spinner.start(`Connecting to '${roomName}'...`);
    const peer = new RTCDoneePeer({
        roomName: roomName,
        signalingServer: SIGNALING_SERVER,
    });
    const ptyTerminal = new PseudoTerminal();
    peer.on("connection_established", () => {
        Spinner.succeed(Spinner.text);
        ptyTerminal.print({
            type: "RSLT",
            data: "Connected to peer! \n\n",
        });
        ////Observe how we set callbacks everytime `connection_established` gets fired///
        ptyTerminal.onType((command) => {
            return peer.send(JSON.stringify({ eventName: "command", data: command }));
        });
        peer.onmessage = (commandResult) => {
            const commandResultJSON = JSON.parse(commandResult);
            ptyTerminal.print(commandResultJSON);
            if (clearANSIFormatting(commandResultJSON.data).trim() == "exit") {
                terminateProcess(peer);
            }
        };
        ////Observe how we set callbacks everytime `connection_established` gets fired///
        process.on("SIGINT", () => confirmBeforeTerminate(peer));
        //////Immediately send container creation command////////////////////////////////
        peer.send(JSON.stringify({
            eventName: "create_container",
            data: { image: image },
        }));
    });
    await new Promise((res) => {
        setTimeout(res, 1000 * 123);
    });
};
const confirmBeforeTerminate = async (peer) => {
    console.log("\n\nAre you sure? Your connection will be terminated. (y/Y)");
    var stdin = process.openStdin();
    stdin.addListener("data", (d) => {
        const response = d.toString().trim();
        if (response === "y" || response === "Y") {
            terminateProcess(peer);
        }
    });
};
const terminateProcess = (peer) => {
    peer.send(JSON.stringify({
        eventName: "command",
        data: {
            type: "CMD",
            data: "exit\n",
        },
    }));
    const stdin = process.openStdin();
    stdin.removeAllListeners();
    process.exit(1);
};
const DoneeActions = {
    listRooms,
    chooseFromAvailableRooms,
    checkRoomAvailability,
    obtainImageName,
    connect,
};

var webrtc_io$1 = {};

//SERVER
var WebSocketServer = require$$0.Server;

var iolog = function() {};

for (var i = 0; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg === "-debug") {
    iolog = function(msg) {
      console.log(msg);
    };
    console.log('Debug mode on!');
  }
}


// Used for callback publish and subscribe
if (typeof rtc === "undefined") {
  var rtc = {};
}
//Array to store connections
rtc.sockets = [];

rtc.rooms = {};

// Holds callbacks for certain events.
rtc._events = {};

rtc.on = function(eventName, callback) {
  rtc._events[eventName] = rtc._events[eventName] || [];
  rtc._events[eventName].push(callback);
};

rtc.fire = function(eventName, _) {
  var events = rtc._events[eventName];
  var args = Array.prototype.slice.call(arguments, 1);

  if (!events) {
    return;
  }

  for (var i = 0, len = events.length; i < len; i++) {
    events[i].apply(null, args);
  }
};

webrtc_io$1.listen = function(server) {
  var manager;
  if (typeof server === 'number') { 
    manager = new WebSocketServer({
        port: server
      });
  } else {
    manager = new WebSocketServer({
      server: server
    });
  }

  manager.rtc = rtc;
  attachEvents(manager);
  return manager;
};

function attachEvents(manager) {

  manager.on('connection', function(socket) {
    iolog('connect');

    socket.id = id();
    iolog('new socket got id: ' + socket.id);

    rtc.sockets.push(socket);

    socket.on('message', function(msg) {
      var json = JSON.parse(msg);
      rtc.fire(json.eventName, json.data, socket);
    });

    socket.on('close', function() {
      iolog('close');

      // find socket to remove
      var i = rtc.sockets.indexOf(socket);
      // remove socket
      rtc.sockets.splice(i, 1);

      // remove from rooms and send remove_peer_connected to all sockets in room
      var room;
      for (var key in rtc.rooms) {

        room = rtc.rooms[key];
        var exist = room.indexOf(socket.id);

        if (exist !== -1) {
          room.splice(room.indexOf(socket.id), 1);
          for (var j = 0; j < room.length; j++) {
            console.log(room[j]);
            var soc = rtc.getSocket(room[j]);
            soc.send(JSON.stringify({
              "eventName": "remove_peer_connected",
              "data": {
                "socketId": socket.id
              }
            }), function(error) {
              if (error) {
                console.log(error);
              }
            });
          }
          break;
        }
      }
      // we are leaved the room so lets notify about that
      rtc.fire('room_leave', room, socket.id);
      
      // call the disconnect callback
      rtc.fire('disconnect', rtc);

    });
    

    // call the connect callback
    rtc.fire('connect', rtc);

  });

  // manages the built-in room functionality
  rtc.on('join_room', function(data, socket) {
    iolog('join_room');

    var connectionsId = [];
    var roomList = rtc.rooms[data.room] || [];

    roomList.push(socket.id);
    rtc.rooms[data.room] = roomList;


    for (var i = 0; i < roomList.length; i++) {
      var id = roomList[i];

      if (id == socket.id) {
        continue;
      } else {

        connectionsId.push(id);
        var soc = rtc.getSocket(id);

        // inform the peers that they have a new peer
        if (soc) {
          soc.send(JSON.stringify({
            "eventName": "new_peer_connected",
            "data":{
              "socketId": socket.id
            }
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }
    }
    // send new peer a list of all prior peers
    socket.send(JSON.stringify({
      "eventName": "get_peers",
      "data": {
        "connections": connectionsId,
        "you": socket.id
      }
    }), function(error) {
      if (error) {
        console.log(error);
      }
    });
  });

  //Receive ICE candidates and send to the correct socket
  rtc.on('send_ice_candidate', function(data, socket) {
    iolog('send_ice_candidate');
    var soc = rtc.getSocket(data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_ice_candidate",
        "data": {
          "label": data.label,
          "candidate": data.candidate,
          "socketId": socket.id
        }
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });

      // call the 'recieve ICE candidate' callback
      rtc.fire('receive ice candidate', rtc);
    }
  });

  //Receive offer and send to correct socket
  rtc.on('send_offer', function(data, socket) {
    iolog('send_offer');
    var soc = rtc.getSocket(data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_offer",
        "data": {
          "sdp": data.sdp,
          "socketId": socket.id
      }
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
    // call the 'send offer' callback
    rtc.fire('send offer', rtc);
  });

  //Receive answer and send to correct socket
  rtc.on('send_answer', function(data, socket) {
    iolog('send_answer');
    var soc = rtc.getSocket( data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_answer",
        "data" : {
          "sdp": data.sdp,
          "socketId": socket.id
        }
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });
      rtc.fire('send answer', rtc);
    }
  });
}

// generate a 4 digit hex code randomly
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// make a REALLY COMPLICATED AND RANDOM id, kudos to dennis
function id() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

rtc.getSocket = function(id) {
  var connections = rtc.sockets;
  if (!connections) {
    // TODO: Or error, or customize
    return;
  }

  for (var i = 0; i < connections.length; i++) {
    var socket = connections[i];
    if (id === socket.id) {
      return socket;
    }
  }
};

var webrtc_io = webrtc_io$1;

const router = express.Router();
router.use(express.json());
const CONTAINER_HEALTH_TIMEOUT = 30;
const isAvailable = (metric) => {
    const timeDiff = Math.round((new Date().getTime() - new Date(metric.lastUpdated).getTime()) / 1000);
    // Available only if donor sent metrics in the last 30s and isn't connected to a peer
    return timeDiff <= CONTAINER_HEALTH_TIMEOUT && Object.keys(metric.containers || {}).length == 0;
};
// List available
router.get("/available", (req, res) => {
    try {
        let metrics = metricStore.list();
        let avaiableDonors = metrics.filter(isAvailable);
        const response = {
            metrics: avaiableDonors,
        };
        return res.json(response);
    }
    catch (err) {
        logger.error(err);
        return res.status(500).json({ error: err.message });
    }
});
// List metrics
router.get("/", (req, res) => {
    try {
        let metrics = metricStore.list();
        const response = {
            metrics: metrics,
        };
        return res.json(response);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Update metrics
router.post("/", (req, res) => {
    try {
        const metric = req.body;
        metricStore.set(metric);
        return res.sendStatus(200);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Get metric from roomName
router.get("/:roomName", (req, res) => {
    try {
        const roomName = req.params.roomName;
        const metric = metricStore.get(roomName);
        if (!metric) {
            return res.sendStatus(404);
        }
        else {
            return res.json(metric);
        }
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const DEFAULT = {
    PORT: 8080,
    JSON_INDENTATION: 40,
};
function startServer(port = DEFAULT.PORT) {
    const expressApp = express();
    const httpServer = http.createServer(expressApp);
    webrtc_io.listen(httpServer);
    expressApp.set("json spaces", DEFAULT.JSON_INDENTATION);
    /**----- specify all exposed REST endpoints here------- */
    expressApp.get("/hello", (req, res) => {
        res.json({ message: "Hello, World!" });
    });
    expressApp.use("/metrics", router);
    /**---------------------------------------------------- */
    httpServer.on("error", (e) => {
        //TODO: test this. e.code or e.name?? no clue
        if (e.name === "EADDRINUSE") {
            logger.error(`Port ${port} is already in use. Please use another port`);
        }
        process.exit(1);
    });
    httpServer.on("listening", (e) => {
        const address = httpServer.address();
        if (!address) {
            logger.error(`Signaling server started on ....err what!?`);
            process.exit(1);
        }
        else if (typeof address === "string")
            logger.info(`Signaling server started on ${address}`);
        else
            logger.info(`Signaling server started on ${address.address}:${address.port}`);
    });
    httpServer.listen(port);
}
const BrokerActions = {
    startServer
};

const program = new Command();
program
    .name("rh")
    .description("Share your resources through vt100")
    .version("0.1.0");
///////////////////////
// Auth commands // NOT IMPLEMENTED
///////////////////////
program
    .command("login")
    .argument("<email>", "Email of the user")
    .description("Login to rh")
    .action(loginUser);
///////////////////////
// Donor Commands
///////////////////////
program
    .command("init")
    .option("--max-cpu <percent>", "Max CPU % to allocate")
    .option("--max-memory <percent>", "Max Memory % to allocate")
    .option("--max-disk <size>", "Max disk space to allocate")
    .description("Initialize rh daemon")
    .action(async (options, _) => {
    catchAllBrokerDeathWrapper(async () => DonorActions.init(options.maxCpu, options.maxMemory, options.maxDisk))(options.maxCpu, options.maxMemory, options.maxDisk);
});
program
    .command("kill")
    .description("Kill rh daemon")
    .action(catchAllBrokerDeathWrapper(DonorActions.kill));
///////////////////////
// Consumer commands
///////////////////////
program
    .command("list")
    .description("List donors to connect")
    .action(catchAllBrokerDeathWrapper(() => pipe(DoneeActions.listRooms, andThen(DoneeActions.chooseFromAvailableRooms), andThen(DoneeActions.checkRoomAvailability), andThen(DoneeActions.obtainImageName))().then(([roomName, image]) => DoneeActions.connect(roomName, image))));
program
    .command("init-broker", { hidden: true })
    .addOption(new Option("-p,--port <port>", "Port to start the signalling server")
    .default("8080")
    .argParser(parsePort))
    .description("Start the WebRTC signaling server")
    .action((options) => {
    BrokerActions.startServer(options.port);
});
function parsePort(port, _) {
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort))
        throw new InvalidArgumentError("Port should be a number between 4000 and 9000");
    if (parsedPort < 4000 || parsedPort > 9000)
        throw new InvalidArgumentError("Port should be a number between 4000 and 9000");
    return parsedPort;
}
const init = async () => {
    const { default: boxen } = await import('boxen');
    Spinner.start(magentaBright("...Initializing"));
    const q = await fetch(RANDOM_ANIME_QUOTES).then((r) => r.json());
    Spinner.stop();
    console.log(boxen("\n" +
        bold(yellow(figlet.textSync("vt100", {
            font: "Colossal",
            horizontalLayout: "default",
            verticalLayout: "default",
            whitespaceBreak: true,
            width: 200,
        }))), {
        borderStyle: "round",
        float: "center",
        title: "Resources for everyone...",
        titleAlignment: "center",
    }));
    console.log(boxen(bold(blackBright(q.quote)) +
        `                                                       -${q.character}(${q.anime})`, { float: "center", width: 78 }) + "\n\n");
    program.parse();
};
init();
