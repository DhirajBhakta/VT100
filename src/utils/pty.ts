import pty, { IPty } from "node-pty";
import readline from "readline";
import logger, { devLogger } from "./log.js";

const sleep = (secs: number) => new Promise((r) => setTimeout(r, secs * 1000));

interface TerminalConfig {
  devtest?: boolean;
}
export class Terminal {
  /**
   * JOB: take input via method call, execute and send output through callback (another method)
   * but NEVER print
   */
  static PAUSE = "\x13";
  static RESUME = "\x11";
  _pty?: IPty;
  history = [">>START"];

  constructor({ devtest }: TerminalConfig = {}) {
    if (devtest) this.devtest();
    else {
      this._pty = pty.spawn("bash", [], {});
    }
  }

  set onoutput(onOutput: (results: string) => void) {
    this._pty?.onData((results: string) => {
      if(results.trim() != this.history[this.history.length - 1].trim()) {
          onOutput(results);
        }
    });
  }
  set onclose(onClose: (ev: any) => void) {
    this._pty?.onExit(onClose);
  }

  write(data: string) {
    data = data.slice(1, -3);
    this.history.push(data);
    logger.info("data.endswith rrrr: " + data.endsWith("\r"))
    const carriageReturn = data.endsWith("\r") ? "" : "\r";
    this._pty!.write(data + carriageReturn);
  }

  pause() {
    this._pty!.write(Terminal.PAUSE);
  }
  resume() {
    this._pty!.write(Terminal.RESUME);
  }
  devtest() {
    (() => {
      const term = new Terminal();
      term.onoutput = (results) => process.stdout.write(results);
      term.onclose = () => devLogger.silly(term.history);
      const rl = readline.createInterface({ input: process.stdin });
      rl.on("line", (cmd) => term.write(cmd));
    })();
  }
}
interface PseudoTerminalConfig {
  customPrinter?: (results: string) => void;
  devtest?: boolean;
}
export class PseudoTerminal {
  /**
   * JOB: take input and print --> === === --> take output and print
   * but NEVER Execute
   */
  customPrinter: PseudoTerminalConfig["customPrinter"];
  history = [">>START"];

  constructor({ devtest, customPrinter }: PseudoTerminalConfig = {}) {
    if (devtest) this.devtest();
    this.customPrinter = customPrinter;
  }
  set oninput(onInput: (input: string) => void) {
    process.stdin.on("data", (input) => {
      const command = input.toString("utf-8");
      onInput(command);
      this.history.push(command);
    });
  }
  set onclose(onClose: (data: any) => void) {
    onClose(this.history);
  }

  print(results: string) {
    logger.debug("Reached fukin here:::")
    if (this.customPrinter) this.customPrinter(results);
    else process.stdout.write(results);
  }
  devtest() {
    (async () => {
      const pterm = new PseudoTerminal();
      pterm.oninput = async (input) => {
        devLogger.silly("Assume that im sending this data across: " + input);
        let count = 0;
        while (count++ < 4) {
          await sleep(1);
          pterm.print(".");
        }
      };
      await sleep(7);
      pterm.print("This is your output: <output>");
      devLogger.silly(pterm.history);
    })();
  }
}
