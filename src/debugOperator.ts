import Debug from "debug";
import { Observable } from "rxjs";

const debug = Debug("rxjs:debug");

export function debugOperator<T>(prefix: string) {
  return (source: Observable<T>) => {
    return new Observable<T>(subscriber => {
      debug(`${prefix} subscribe`);
      const subscription = source.subscribe({
        next(val: T) {
          debug(`${prefix} next(%o)`, val);
          subscriber.next(val);
        },
        error(err: any) {
          debug(`${prefix} error(%o)`, err);
          subscriber.error(err);
        },
        complete() {
          debug(`${prefix} complete`);
          subscriber.complete();
        }
      });
      return () => {
        debug(`${prefix} unsubscribe`);
        subscription.unsubscribe();
      };
    });
  };
}
