import { createLogger, format, transports } from "winston";
const { combine, printf } = format;
import ora from "ora";

const logFormat = printf(({ level, message, stack }) => {
  return `[${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: "info",
  silent: false, //set this to true later
  format: combine(
    format.errors({ stack: true }),
    format.colorize({ all: true }),
    logFormat
  ),
  transports: [
    new transports.Console({
      level: "info",
      format: format.colorize({ all: true }),
    }),
    new transports.File({ filename: "combined.log" }),
  ],
});


export const catchAllBrokerDeathWrapper =
  (commanderAction: (...args: any[]) => Promise<void>) =>
  async (...args: any[]) => {
    try {
      return await commanderAction(args);
    } catch (error) {
      logger.error(
        "Broker is possibly dead. Restart broker by issuing `vt init-broker` on a machine with public IP"
      );
      process.exit(1);
    }
  };

//CORRECT USAGE:  https://github.com/sindresorhus/ora/blob/main/example.js
//PR: https://github.com/sindresorhus/ora/pull/112
//ISSUE: https://github.com/sindresorhus/ora/issues/97
export const Spinner = ora({ discardStdin: false });

export default logger;
