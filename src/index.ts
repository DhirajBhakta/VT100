import { Command, InvalidArgumentError, Option } from "commander";
import figlet from "figlet";
import { bold, magentaBright, yellow, blackBright } from "colorette";
import { loginUser } from "./utils/auth.js";
import { DonorActions } from "./cli/donor.js";
import { DoneeActions } from "./cli/donee.js";
import { BrokerActions } from "./cli/broker.js";
import fetch from "isomorphic-fetch";

import { RANDOM_ANIME_QUOTES } from "./config.js";
import { andThen, pipe } from "ramda";
import { catchAllBrokerDeathWrapper, Spinner } from "./utils/log.js";
const program = new Command();

program
  .name("vt")
  .description("Share your resources through vt100")
  .version("0.1.0");

///////////////////////
// Auth commands // NOT IMPLEMENTED
///////////////////////
program
  .command("login")
  .argument("<email>", "Email of the user")
  .description("Login to vt100")
  .action(loginUser);

///////////////////////
// Donor Commands
///////////////////////
program
  .command("init")
  .option("--max-cpu <percent>", "Max CPU % to allocate")
  .option("--max-memory <percent>", "Max Memory % to allocate")
  .option("--max-disk <size>", "Max disk space to allocate")
  .description("Initialize vt100 daemon")
  .action(async (options: any, _: any) => {
    catchAllBrokerDeathWrapper(async () =>
      DonorActions.init(options.maxCpu, options.maxMemory, options.maxDisk)
    )(options.maxCpu, options.maxMemory, options.maxDisk);
  });

program
  .command("kill")
  .description("Kill vt100 daemon")
  .action(catchAllBrokerDeathWrapper(DonorActions.kill as any));

///////////////////////
// Consumer commands
///////////////////////
program
  .command("list")
  .description("List donors to connect")
  .action(
    catchAllBrokerDeathWrapper(() =>
      pipe(
        DoneeActions.listRooms,
        andThen(DoneeActions.chooseFromAvailableRooms),
        andThen(DoneeActions.checkRoomAvailability),
        andThen(DoneeActions.obtainImageName)
      )().then(
        ([roomName, image]) => DoneeActions.connect(roomName, image) as any
      )
    )
  );

program
  .command("init-broker", { hidden: true })
  .addOption(
    new Option("-p,--port <port>", "Port to start the signaling server")
      .default("8080")
      .argParser<number>(parsePort)
  )
  .description("Start the WebRTC signaling server")
  .action((options) => {
    BrokerActions.startServer(options.port);
  });

function parsePort(port: string, _: number): number {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort))
    throw new InvalidArgumentError(
      "Port should be a number between 4000 and 9000"
    );
  if (parsedPort < 4000 || parsedPort > 9000)
    throw new InvalidArgumentError(
      "Port should be a number between 4000 and 9000"
    );
  return parsedPort;
}

const init = async () => {
  const { default: boxen } = await import("boxen");
  Spinner.start(magentaBright("...Initializing"));
  const q = await fetch(RANDOM_ANIME_QUOTES).then((r) => r.json());
  Spinner.stop();
  console.log(
    boxen(
      "\n" +
        bold(
          yellow(
            figlet.textSync("vt100", {
              font: "Colossal",
              horizontalLayout: "default",
              verticalLayout: "default",
              whitespaceBreak: true,
              width: 200,
            })
          )
        ),
      {
        borderStyle: "round",
        float: "center",
        title: "Resources for everyone...",
        titleAlignment: "center",
      }
    )
  );
  console.log(
    boxen(
      bold(blackBright(q.quote)) +
        `                                                       -${q.character}(${q.anime})`,
      { float: "center", width: 78 }
    ) + "\n\n"
  );
  program.parse();
};

init();
