import Debug from "debug";
import { Observable } from "rxjs";
import { Readable } from "stream";

const debug = Debug("rxjs:fromStream");

export interface FromStreamOptions {
  dataEvent?: string;
  errorEvent?: string;
  endEvent?: string;
  pause$?: Observable<boolean>;
}

export function fromStream<T>(
  stream: Readable,
  {
    dataEvent = "data",
    errorEvent = "error",
    endEvent = "end",
    pause$
  }: FromStreamOptions = {}
) {
  return new Observable<T>(subscriber => {
    if (pause$ != null) {
      subscriber.add(pause$.subscribe(pauseObserver()));
    }

    stream.addListener(dataEvent, onStreamData);
    stream.addListener(errorEvent, onStreamError);
    stream.addListener(endEvent, onStreamEnd);

    return () => {
      stream.removeListener(dataEvent, onStreamData);
      stream.removeListener(errorEvent, onStreamError);
      stream.removeListener(endEvent, onStreamEnd);
    };

    function onStreamData(data: T) {
      subscriber.next(data);
    }

    function onStreamError(err: any) {
      subscriber.error(err);
    }

    function onStreamEnd() {
      subscriber.complete();
    }

    function pauseObserver() {
      return {
        next: onPause,
        error: subscriber.error.bind(subscriber),
        complete: subscriber.complete.bind(subscriber)
      };
    }

    function onPause(pause: boolean) {
      debug(`onPause(%o)`, pause);
      if (pause) {
        stream.pause();
      } else {
        stream.resume();
      }
    }
  });
}
