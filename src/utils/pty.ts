import { execSync } from "child_process";
import pty, { IPty } from "node-pty";
import readline from "readline";

interface TerminalConfig {
  ptyProcess?: IPty;
}
interface STDOUTdata {
  type: "CREATE_CONTAINER" | "CMD" | "RSLT";
  data: string;
}
export interface Command extends STDOUTdata {
  type: "CREATE_CONTAINER" | "CMD";
}
export interface CommandResult extends STDOUTdata {
  type: "RSLT";
}

// https://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings/29497680
export const clearANSIFormatting = (str: string) => {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
};

export class Terminal {
  _pty?: IPty;
  history: Array<Command> = [];
  name: string;
  onoutput =  (rslt: CommandResult) => {};
  onclose =  (ev:any) =>{}

  constructor({ name }: any) {
    this.name = name;
    this.sanitizeCommandResult = this.sanitizeCommandResult.bind(this);
    this.write = this.write.bind(this);
  }

  //https://github.com/microsoft/node-pty/issues/429
  // Function to clear input echo
  sanitizeCommandResult(cmdStr: string) {
    /* 
      Docker output always contains user cli line AFTER the input echo
      Example:
        pwd                                           
        /                                                           
        ]0;root@a52a3c0eaa27: /root@a52a3c0eaa27:/#
      This is sometimes sent separately or even *along with the output* 
      So, we can't discard the entire line as it might contain the actual output too
      Hence, removing the FIRST occurrence of the last command from the output
      (along with any carriage returns)
    */

    let _1 = cmdStr;
    let _2 = [...this.history].pop()?.data.trim();

    if (_2) {
      // Remove last command from the beginning
      if (_1.indexOf(_2) === 0) {
        _1 = _1.replace(_2, "");
        cmdStr = cmdStr.replace(_2, "");
      }

      // Remove any combination of carriage returns from the beginning
      if (_1.indexOf("\r\n") === 0) {
        _1 = _1.replace("\r\n", "");
      }
      if (_1.indexOf("\r") === 0) {
        _1 = _1.replace("\r", "");
      }
      if (_1.indexOf("\n") === 0) {
        _1 = _1.replace("\n", "");
      }
    }
    return _1;
  }


  write(data: Command) {
    this.history.push(data);
    if (data.type === "CREATE_CONTAINER") {
      execSync(`docker rm -f ${this.name}`);
      const image = data.data;
      this._pty = pty.spawn(
        "docker",
        ["run", "-it", "--privileged", "--name=" + this.name, image, "bash"],
        {}
      );
      this._pty?.onData((cmdStr: string) => {
        cmdStr = this.sanitizeCommandResult(cmdStr);
        const commandResult: CommandResult = {
          type: "RSLT",
          data: cmdStr,
        };
        this.onoutput(commandResult);
      });
      this._pty?.onExit(this.onclose);
      return;
    } else if (data.type === "CMD") {
      this._pty && this._pty!.write(data.data);
    }
  }
}

export class PseudoTerminal {
  history: Array<Command> = [];
  rl: readline.Interface;
  onExitCallback: () => void;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
    });
    this.print = this.print.bind(this);
  }
  onExit(cb: () => void) {
    process.on("SIGINT", cb);
    this.onExitCallback = cb;
  }
  onType(onInput: (command: Command) => void) {
    this.rl.on("line", (line) => {
      const command: Command = {
        type: "CMD",
        data: line + "\n",
      };
      onInput(command);
      this.history.push(command);
    });
  }

  print(result: CommandResult) {
    process.stdout.write(result.data);
    if (clearANSIFormatting(result.data).trim() === "exit") {
      this.onExitCallback && this.onExitCallback();
    }
  }
}
