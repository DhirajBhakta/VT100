import express from "express";
import http from "http";
import * as pkg from "webrtc.io";
import logger from "../utils/log.js";
import routes from "../express/broker-routes.js";

const DEFAULT = {
  PORT: 8080,
  JSON_INDENTATION: 40,
};

export function startServer(port = DEFAULT.PORT) {
  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  (pkg as any).listen(httpServer);
  
  expressApp.set("json spaces", DEFAULT.JSON_INDENTATION);

  /**----- specify all exposed REST endpoints here------- */
  expressApp.get("/hello", (req, res) => {
    res.json({ message: "Hello, World!" });
  });

  expressApp.use("/metrics", routes)
  
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
    else logger.info(`Signaling server started on ${address.address}:${address.port}`);
  });
  httpServer.listen(port);
}



export const BrokerActions = {
  startServer
};