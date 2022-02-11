import { pipe } from "ramda";
import { WebSocket } from "ws";
import pkg from "wrtc";
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = pkg;
import logger, { Deferred } from "./log.js";

/**--------CONFIG & SETUP--------------------- */

type SocketId = string;
type EventName = string;
type StrictConfig = {
  signalingServer: string | URL;
  iceServer: string;
  roomName: string;
  trickle: boolean;
};
type Config = Partial<StrictConfig>;
type PeerHandle = {
  socketId: SocketId;
  peerConnection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
};
declare namespace Command {
  interface getPeers {
    you: SocketId;
    connections: Array<SocketId>;
  }
  interface Cmd {
    eventName: string;
    data: {
      socketId: SocketId;
    };
  }
  interface newPeerConnected extends Cmd {}
  interface removePeerConnected extends Cmd {}
  interface sendOffer extends Cmd {
    data: Cmd["data"] & {
      sdp: RTCSessionDescription;
    };
  }
  interface receiveOffer extends sendOffer {}
  interface sendAnswer extends sendOffer {}
  interface receiveAnswer extends receiveOffer {}
  interface receiveIceCandidate extends Cmd {
    data: Cmd["data"] & {
      label: string;
      candidate: RTCIceCandidate;
    };
  }
  interface sendIceCandidate extends receiveIceCandidate {}
}

const defaultConfig: Partial<Config> = {
  signalingServer: "ws://localhost:8080",
  iceServer: "stun:stun.l.google.com:19302",
  roomName: "lorem",
  //default is trickle=true unless specified otherwise
  trickle: process.env["TRICKLE"]
    ? process.env["TRICKLE"].toLowerCase() === "true"
    : true,
};

class Peer {
  Q: Array<RTCIceCandidate> = [];
  connections: Array<SocketId> = [];
  peerConnections: Record<SocketId, RTCPeerConnection> = {};
  dataChannels: Record<SocketId, RTCDataChannel> = {};
  callbacks: Record<EventName, Array<Function>> = {};
  socket: WebSocket | null = null;
  config: Config;
  whoAmI: SocketId = "";
  _: Record<any, any> = {};

  constructor(config: Config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    logger.debug("TRICKLE mode=", this.config.trickle);
    this.register = this.register.bind(this);
    this.fire = this.fire.bind(this);
    this.on = this.on.bind(this);
    this.handleCommandsFromCentralServer =
      this.handleCommandsFromCentralServer.bind(this);
    this.getSocketIdForPeerConnection =
      this.getSocketIdForPeerConnection.bind(this);
    try {
      this.socket = new WebSocket(config.signalingServer as string);
    } catch (err) {
      logger.error(err);
    }
    if (this.socket) {
      pipe(
        this.handleError,
        this.handleClose,
        this.handleCommandsFromCentralServer
      )(this.socket);
      this.socket.onopen = () => {
        this.register(this.socket);
      };
      this.on(
        "remove_peer_connected",
        ({ data }: Command.removePeerConnected) => {
          if (data && data.socketId) delete this.peerConnections[data.socketId];
        }
      );
    }
  }

  //category: interfacing with centralserver
  fire(commandName: string, ...args: Array<any>) {
    (this.callbacks[commandName] || []).map((cb) => cb(...args));
  }

  //category: interfacing with centralserver
  on(commandName: string, callback: Function) {
    this.callbacks[commandName] = this.callbacks[commandName] || [];
    this.callbacks[commandName].push(callback);
  }

  //category:util
  register(socket: WebSocket | null) {
    socket &&
      socket.send(
        JSON.stringify({ eventName: "join_room", data: this.config.roomName })
      );
    return socket;
  }

  //category:util
  handleError(socket: WebSocket | null) {
    if (socket) socket.onerror = logger.error;
    return socket;
  }

  //category:util
  handleClose(socket: WebSocket | null) {
    if (socket)
      socket.onclose = () => {
        //TODO: destructor and cleanup
        logger.info(
          "Socket closed, Peer killed. I will no longer listen to any commands or REST API calls"
        );
      };
    return socket;
  }
  //category:util
  getSocketIdForPeerConnection(peerConnection: RTCPeerConnection) {
    for (let socketId in this.peerConnections)
      if (peerConnection === this.peerConnections[socketId]) return socketId;
    logger.error(
      "SocketID not found for given peerConnection. Seems like you messed up."
    );
    process.exit(1);
  }
  //category:util
  getSocketIdForDataChannel(dataChannel: RTCDataChannel) {
    for (let socketId in this.dataChannels)
      if (dataChannel === this.dataChannels[socketId]) return socketId;
    logger.error(
      "SocketID not found for given dataChannel. Seems like you messed up."
    );
    process.exit(1);
  }
  handleCommandsFromCentralServer(socket: WebSocket | null) {
    if (socket)
      socket.onmessage = ({ data }: any) => {
        data = JSON.parse(data);
        this.fire(data.eventName, data.data);
      };
  }
  sendMessageToCentralServer(msg: any) {
    if (this.socket && this.socket.readyState == this.socket.OPEN) {
      this.socket.send(JSON.stringify(msg));
      logger.silly(`Sending MSG to central server:${JSON.stringify(msg)}`);
    }
  }
  relayMessageThroughCentralServer(msg: any) {
    this.sendMessageToCentralServer(msg); //L.O.L
  }
}

class RTCPeer extends Peer {
  peerHandle: PeerHandle | null = null;
  cerberus: Deferred = new Deferred();
  constructor(config: Config) {
    super(config);
    this.on("receive_ice_candidate", (data: any) => {
      this.onReceiveIceCandidate(data.socketId, data.candidate);
    });
    this.peerConnectionOnIceCandidate =
      this.peerConnectionOnIceCandidate.bind(this);
    this.createPeerHandle = this.createPeerHandle.bind(this);
    this.dataChannelOnMessage = this.dataChannelOnMessage.bind(this);
    this.dataChannelOnOpen = this.dataChannelOnOpen.bind(this);
    this.onReceiveIceCandidate = this.onReceiveIceCandidate.bind(this);
    this.peerConnectionOnDataChannel =
      this.peerConnectionOnDataChannel.bind(this);
    this.peerConnectionOnNegotiationNeeded =
      this.peerConnectionOnNegotiationNeeded.bind(this);
    this.peerConnectionOnIceConnectionStateChange =
      this.peerConnectionOnIceConnectionStateChange.bind(this);
  }
  send(jsonStringified: string) {
    if (
      !this.peerHandle ||
      !this.peerHandle.dataChannel ||
      this.peerHandle.dataChannel.readyState !== "open"
    ) {
      logger.debug(
        `DataChannel not yet ready. Unable to send msg: ${jsonStringified}`
      );
    } else {
      this.peerHandle.dataChannel.send(jsonStringified);
    }
  }
  set onmessage(callback: Function) {
    if (!this.peerHandle || !this.peerHandle.dataChannel) {
      this._["onmessage"] = callback;
      logger.silly("Not attaching onmessage handler right away..");
    } else {
      this.peerHandle.dataChannel.onmessage = ({ data }) => {
        if (data) callback(data);
      };
      logger.silly("Attached onmessage handler");
    }
  }
  connectedToPeer() {
    return this.cerberus.promise;
  }

  createPeerHandle(socketId: SocketId) {
    const peerConnection = this.createRTCPeerConnection(socketId);
    return { socketId, peerConnection };
  }

  onReceiveIceCandidate(socketId: SocketId, candidate: RTCIceCandidate) {
    if (!this.peerConnections[socketId]) {
      logger.error("You fucked up the flow. Gon kill myself. Bye...");
      process.exit(1);
    }
    logger.debug("Received an ICE candidate from:" + socketId);
    const rtcIceCandidate = new RTCIceCandidate(candidate);
    const pc = this.peerConnections[socketId];
    if (pc.remoteDescription) pc.addIceCandidate(rtcIceCandidate);
    else this.Q.push(rtcIceCandidate);
  }
  sendIceCandidate(socketId: SocketId, candidate: RTCIceCandidate) {
    this.relayMessageThroughCentralServer({
      eventName: "send_ice_candidate",
      data: {
        label: this.config.roomName,
        candidate,
        socketId,
      },
    });
  }
  sendSdp(socketId: SocketId) {
    if (!this.peerHandle) {
      logger.error(
        "Incorrect State. Cannot send SDP because peerHandle=null. Exiting..."
      );
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
  sendOffer(socketId: SocketId) {
    this.sendSdp(socketId);
  }
  sendAnswer(socketId: SocketId) {
    this.sendSdp(socketId);
  }
  createRTCPeerConnection(socketId: SocketId) {
    if (socketId in this.peerConnections) {
      logger.debug("RTCPeerConnection already exists for socketID:" + socketId);
      return;
    }
    const pc = (this.peerConnections[socketId] = new RTCPeerConnection({
      iceServers: [
        {
          urls: `${this.config.iceServer}`,
        },
        {
          urls: "turn:numb.viagenie.ca",
          username: "dhirajbhakta110@gmail.com",
          credential: "6UM588cb3ZTRfsn",
        },
      ],
    }));
    pipe(
      this.peerConnectionOnDataChannel,
      this.peerConnectionOnIceCandidate
      // this.peerConnectionOnIceConnectionStateChange,
      // this.peerConnectionOnNegotiationNeeded
    )(pc);
    return pc;
  }
  createDataChannel(socketId: SocketId) {
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
    pipe(
      this.dataChannelOnOpen,
      this.dataChannelOnClose,
      this.dataChannelOnError,
      this.dataChannelOnMessage
    )(dc);
    return dc;
  }
  peerConnectionOnDataChannel(peerConnection: RTCPeerConnection) {
    peerConnection.ondatachannel = ({ channel }) => {
      const socketId = this.getSocketIdForPeerConnection(peerConnection);
      pipe(
        this.dataChannelOnOpen,
        this.dataChannelOnClose,
        this.dataChannelOnError,
        this.dataChannelOnMessage
      )(channel);
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
  peerConnectionOnIceCandidate(peerConnection: RTCPeerConnection) {
    const socketId = this.getSocketIdForPeerConnection(peerConnection);
    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) this.sendIceCandidate(socketId, candidate);
      else {
        logger.debug('ICE "Gathering" done!..');
        if (!this.config.trickle) {
          if (peerConnection !== this.peerHandle?.peerConnection)
            logger.error(
              "You fucked up big time. This can happen only in non trickle(slow) mode .Exiting..."
            );
          this.sendSdp(socketId);
        }
      }
    };
    return peerConnection;
  }
  peerConnectionOnIceConnectionStateChange(peerConnection: RTCPeerConnection) {
    peerConnection.oniceconnectionstatechange = (ev) => {
      if (peerConnection.iceConnectionState === "failed") {
        logger.warn(
          "ALERT: ICE RESTART!...good things come to those who WAIT!"
        );
        peerConnection.restartIce();
      }
    };
    return peerConnection;
  }
  peerConnectionOnNegotiationNeeded(peerConnection: RTCPeerConnection) {
    peerConnection.onnegotiationneeded = async (ev) => {
      if (this._["isDonor"]) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
      }
    };
    return peerConnection;
  }
  dataChannelOnOpen(dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => {
      this.fire("connection_established");
      this.cerberus.resolve(null);
    };
    return dataChannel;
  }
  dataChannelOnClose(dataChannel: RTCDataChannel) {
    dataChannel.onclose = () => logger.debug("DataChannel closed");
    return dataChannel;
  }
  dataChannelOnMessage(dataChannel: RTCDataChannel) {
    dataChannel.onmessage = ({ data }) => {
      logger.info(`DataChannel recv msg:${data}`);
      if (data) this.fire("recv", data);
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
  dataChannelOnError(dataChannel: any) {
    dataChannel.onerror = (err: any) =>
      logger.error(`DataChannel error:${err.toString()}`);
    return dataChannel;
  }
}

export class RTCDonorPeer extends RTCPeer {
  count: number = 0;
  constructor(config: Config) {
    super(config);
    this._["isDonor"] = true;
    this.on("new_peer_connected", async (data: any) => {
      if (++this.count > 1) {
        logger.error("This Donor supports only single Donee. Exiting..");
        process.exit(1);
      }
      this.peerHandle = this.createPeerHandle(data.socketId);
      this.peerHandle.dataChannel = this.createDataChannel(data.socketId);
      const offer = await this.peerHandle.peerConnection.createOffer();
      await this.peerHandle.peerConnection.setLocalDescription(offer);
      if (this.config.trickle) this.sendOffer(data.socketId);
    });
    this.on("receive_answer", async (data: any) => {
      this.receiveAnswer(data.socketId, data.sdp);
    });
    this.receiveAnswer = this.receiveAnswer.bind(this);
  }

  async receiveAnswer(socketId: SocketId, answer: any) {
    if (!this.peerConnections[socketId]) {
      logger.error(
        "Cannot recieve answer as peerConnection not found for socketID:" +
          socketId
      );
      process.exit(1);
    }
    const pc = this.peerConnections[socketId];
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      logger.error(err);
    }
    while (this.Q.length > 0) pc.addIceCandidate(this.Q.shift());
  }
}
export class RTCDoneePeer extends RTCPeer {
  constructor(config: Config) {
    super(config);
    this._["isDonor"] = false;
    this.on("receive_offer", async (data: any) => {
      await this.receiveOffer(data.socketId, data.sdp);
      const answer = await this.peerHandle?.peerConnection.createAnswer();
      await this.peerHandle?.peerConnection.setLocalDescription(answer);
      if (this.config.trickle) this.sendAnswer(data.socketId);
    });
    this.on("get_peers", (data: Command.getPeers) => {
      if (data.connections.length > 1) {
        logger.error(
          "Looks like someone else joined the room. Only Donor and me(Donee) were supposed to be there. Exiting..."
        );
        process.exit(1);
      }
      if (data.connections.length === 1) {
        this.peerHandle = this.createPeerHandle(data.connections[0]);
        //no datachannel YET
      } else {
        logger.silly(
          `Ignore this event. connections=0. connections=${data.connections.length}`
        );
      }
    });
  }
  async receiveOffer(socketId: SocketId, offer: any) {
    if (!this.peerConnections[socketId]) {
      logger.error(
        "Cannot receive offer as peerConnection not found for socketID:" +
          socketId
      );
      process.exit(1);
    }
    const pc = this.peerConnections[socketId];
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    while (this.Q.length > 0) pc.addIceCandidate(this.Q.shift());
  }
}
