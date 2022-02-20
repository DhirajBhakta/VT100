import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import logger from "../utils/log.js";
import routes from "../express/broker-routes.js";

const DEFAULT = {
  PORT: 8080,
  JSON_INDENTATION: 40,
};
const rtc: any = {
  sockets: [],
  rooms: {},
  _events: {},
  on: function (eventName, callback) {
    rtc._events[eventName] = rtc._events[eventName] || [];
    rtc._events[eventName].push(callback);
  },
  fire: function (eventName, _) {
    var events = rtc._events[eventName];
    var args = Array.prototype.slice.call(arguments, 1);
    if (!events) {
      return;
    }
    for (var i = 0, len = events.length; i < len; i++) {
      events[i].apply(null, args);
    }
  },
};

const Listen = function (server) {
  const manager:any = new WebSocketServer({
    server: server,
  });
  manager.rtc = rtc;
  manager.on("connection", function (socket) {
    socket.id = id();
    rtc.sockets.push(socket);

    socket.on("message", function (msg) {
      var json = JSON.parse(msg);
      rtc.fire(json.eventName, json.data, socket);
    });

    socket.on("close", function () {
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
            soc.send(
              JSON.stringify({
                eventName: "remove_peer_connected",
                data: {
                  socketId: socket.id,
                },
              }),
              function (error) {
                if (error) {
                  console.log(error);
                }
              }
            );
          }
          break;
        }
      }
      // we are leaved the room so lets notify about that
      rtc.fire("room_leave", room, socket.id);

      // call the disconnect callback
      rtc.fire("disconnect", rtc);
    });

    // call the connect callback
    rtc.fire("connect", rtc);
  });

  // manages the built-in room functionality
  rtc.on("join_room", function (data, socket) {
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
          soc.send(
            JSON.stringify({
              eventName: "new_peer_connected",
              data: {
                socketId: socket.id,
              },
            }),
            function (error) {
              if (error) {
                console.log(error);
              }
            }
          );
        }
      }
    }
    // send new peer a list of all prior peers
    socket.send(
      JSON.stringify({
        eventName: "get_peers",
        data: {
          connections: connectionsId,
          you: socket.id,
        },
      }),
      function (error) {
        if (error) {
          console.log(error);
        }
      }
    );
  });

  //Receive ICE candidates and send to the correct socket
  rtc.on("send_ice_candidate", function (data, socket) {
    var soc = rtc.getSocket(data.socketId);

    if (soc) {
      soc.send(
        JSON.stringify({
          eventName: "receive_ice_candidate",
          data: {
            label: data.label,
            candidate: data.candidate,
            socketId: socket.id,
          },
        }),
        function (error) {
          if (error) {
            console.log(error);
          }
        }
      );

      // call the 'recieve ICE candidate' callback
      rtc.fire("receive ice candidate", rtc);
    }
  });

  //Receive offer and send to correct socket
  rtc.on("send_offer", function (data, socket) {
    var soc = rtc.getSocket(data.socketId);

    if (soc) {
      soc.send(
        JSON.stringify({
          eventName: "receive_offer",
          data: {
            sdp: data.sdp,
            socketId: socket.id,
          },
        }),
        function (error) {
          if (error) {
            console.log(error);
          }
        }
      );
    }
    // call the 'send offer' callback
    rtc.fire("send offer", rtc);
  });

  //Receive answer and send to correct socket
  rtc.on("send_answer", function (data, socket) {
    var soc = rtc.getSocket(data.socketId);

    if (soc) {
      soc.send(
        JSON.stringify({
          eventName: "receive_answer",
          data: {
            sdp: data.sdp,
            socketId: socket.id,
          },
        }),
        function (error) {
          if (error) {
            console.log(error);
          }
        }
      );
      rtc.fire("send answer", rtc);
    }
  });

  // generate a 4 digit hex code randomly
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  // make a REALLY COMPLICATED AND RANDOM id, kudos to dennis
  function id() {
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  }

  rtc.getSocket = function (id) {
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
  return manager;
};

export function startServer(port = DEFAULT.PORT) {
  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  Listen(httpServer);

  expressApp.set("json spaces", DEFAULT.JSON_INDENTATION);

  /**----- specify all exposed REST endpoints here------- */
  expressApp.get("/hello", (req, res) => {
    res.json({ message: "Hello, World!" });
  });

  expressApp.use("/metrics", routes);

  /**---------------------------------------------------- */
  httpServer.on("error", (e: Error) => {
    //TODO: test this. e.code or e.name?? no clue
    if (e.name === "EADDRINUSE") {
      logger.error(`Port ${port} is already in use. Please use another port`);
    }
    process.exit(1);
  });

  httpServer.on("listening", (e: any) => {
    const address = httpServer.address();
    if (!address) {
      logger.error(`Signaling server started on ....err what!?`);
      process.exit(1);
    } else if (typeof address === "string")
      logger.info(`Signaling server started on ${address}`);
    else
      logger.info(
        `Signaling server started on ${address.address}:${address.port}`
      );
  });
  httpServer.listen(port);
}

export const BrokerActions = {
  startServer,
};
