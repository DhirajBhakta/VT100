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
  //constructor does all the job
  const peer = new RTCDoneePeer({
    roomName: roomName,
    image: image,
    signalingServer: SIGNALING_SERVER,
  });
  return new Promise(res => setTimeout(res, 1000*128))
};

export const DoneeActions = {
  listRooms,
  chooseFromAvailableRooms,
  checkRoomAvailability,
  obtainImageName,
  connect,
};
