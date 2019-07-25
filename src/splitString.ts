import { Observable } from "rxjs";

export interface SplitStringOptions {
  separator?: string | RegExp;
  emitTail?: boolean;
}

export function splitString({
  separator = "\n",
  emitTail = true
}: SplitStringOptions = {}) {
  return (source: Observable<string>) => {
    return new Observable<string>(subscriber => {
      let lastPart = "";

      const onError = subscriber.error.bind(subscriber);

      return source.subscribe(onNext, onError, onComplete);

      function onNext(input: string) {
        const parts = input.split(separator);
        if (lastPart) {
          parts[0] = lastPart + parts[0];
        }
        lastPart = parts.pop()!;
        for (const part of parts) {
          subscriber.next(part);
        }
      }

      function onComplete() {
        if (emitTail && lastPart) {
          subscriber.next(lastPart);
        }
        subscriber.complete();
      }
    });
  };
}
