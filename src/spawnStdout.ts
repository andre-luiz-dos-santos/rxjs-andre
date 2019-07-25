import { spawn } from "child_process";
import Debug from "debug";
import { concat, Observable, Subject } from "rxjs";
import { fromStream } from "./fromStream";
import { splitString } from "./splitString";

const debug = Debug("rxjs:spawnStdout");

export interface SpawnStdoutOptions {
  stdin?: string;
  encoding?: string;
  stderrEncoding?: string;
  kill?: boolean;
  pause$?: Observable<boolean>;
}

export function spawnStdout(
  cmd: string[],
  {
    stdin = "",
    encoding = "utf8",
    stderrEncoding = "utf8",
    kill = true,
    pause$
  }: SpawnStdoutOptions = {}
): Observable<string> {
  return new Observable(subscriber => {
    const proc = spawn(cmd[0], cmd.slice(1));
    const proc$ = new Subject<string>();

    proc.stdin.end(stdin);

    proc.stdout.setEncoding(encoding);
    const stdout$ = fromStream<string>(proc.stdout, { pause$ });
    subscriber.add(concat(stdout$, proc$).subscribe(subscriber));

    proc.stderr.setEncoding(stderrEncoding);
    const stderr$ = fromStream<string>(proc.stderr).pipe(splitString());
    subscriber.add(stderr$.subscribe(onStderrLine));

    proc.on("error", onProcError);
    proc.on("exit", onProcExit);

    return () => {
      if (kill === true) {
        proc.kill();
      }
    };

    function onProcError(err: any) {
      kill = false;
      subscriber.error(err);
    }

    function onProcExit(code: number | null, signal: string | null) {
      kill = false;
      if (code !== 0) {
        let msg = `exit code=${code} signal=${signal}`;
        proc$.error(Error(`${cmd[0]}: ${msg}`));
      } else {
        proc$.complete();
      }
    }

    function onStderrLine(text: string) {
      debug("%o stderr: %o", cmd[0], text);
    }
  });
}
