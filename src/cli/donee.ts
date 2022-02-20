import fetch from "isomorphic-fetch";
import inquirer from "inquirer";
import { red, green, bold } from "colorette";
import { clearANSIFormatting, PseudoTerminal } from "../utils/pty.js";
import { RTCDoneePeer } from "../utils/webrtc.js";
import {
  getConsumerPreferences,
  setConsumerPreferences,
  SIGNALING_SERVER,
  SUPPORTED_IMAGES,
  LIST_DONORS_ENDPOINT,
  DONOR_HEARTBEAT_ENDPOINT,
} from "../config.js";
import logger from "../utils/log.js";
import { Spinner } from "../utils/log.js";
import { CommanderImageAnswer } from "@types";

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

const chooseFromAvailableRooms = async (roomsMeta: any[]) => {
  const SEPARATOR = "∘";
  const donorSelectionList: any[] = roomsMeta.map((donor: any) => {
    const timeDiff = Math.round(
      (new Date().getTime() - new Date(donor.lastUpdated).getTime()) / 1000
    );
    const specs = `${bold(donor.roomName)} \n  CPU: ${
      donor.availableCpu
    } ${SEPARATOR} Memory: ${donor.availableMemory} ${SEPARATOR} Disk: ${
      donor.availableDisk
    } ${SEPARATOR} Udated ${timeDiff} seconds ago \n`;
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
  } catch (err) {
    console.log(red("Prompt couldn't be rendered in the current environment"));
    process.exit(1);
  }
};

const checkRoomAvailability = async (roomName: string) => {
  Spinner.start(`Verifying '${roomName}'...`);
  const response = await fetch(DONOR_HEARTBEAT_ENDPOINT(roomName));
  Spinner.stop();
  if (response.status !== 200) {
    console.log(
      red(
        "Donor not available. Try checking for avaiable donors using `vt list`."
      )
    );
    process.exit(1);
  }
  return roomName;
};

const obtainImageName = async (roomName: string) => {
  try {
    const answer = await inquirer.prompt<CommanderImageAnswer>([
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
  } catch (error: any) {
    console.log(red("Prompt couldn't be rendered in the current environment"));
    process.exit(1);
  }
};

const connect = async (roomName: string, image: string) => {
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
    peer.onmessage = (commandResult: string) => {
      const commandResultJSON = JSON.parse(commandResult);
      ptyTerminal.print(commandResultJSON);
      if (clearANSIFormatting(commandResultJSON.data).trim() == "exit") {
        terminateProcess(peer);
      }
    };

    ////Observe how we set callbacks everytime `connection_established` gets fired///
    process.on("SIGINT", () => confirmBeforeTerminate(peer));
    //////Immediately send container creation command////////////////////////////////
    peer.send(
      JSON.stringify({
        eventName: "create_container",
        data: { image: image },
      })
    );
  });
  await new Promise((res) => {
    setTimeout(res, 1000 * 123);
  });
};

const confirmBeforeTerminate = async (peer: RTCDoneePeer) => {
  console.log("\n\nAre you sure? Your connection will be terminated. (y/Y)");
  var stdin = process.openStdin();
  stdin.addListener("data", (d) => {
    const response = d.toString().trim();
    if (response === "y" || response === "Y") {
      terminateProcess(peer);
    }
  });
};

const terminateProcess = (peer: RTCDoneePeer) => {
  peer.send(
    JSON.stringify({
      eventName: "command",
      data: {
        type: "CMD",
        data: "exit\n",
      },
    })
  );
  const stdin = process.openStdin();
  stdin.removeAllListeners();
  process.exit(1);
};

export const DoneeActions = {
  listRooms,
  chooseFromAvailableRooms,
  checkRoomAvailability,
  obtainImageName,
  connect,
};
