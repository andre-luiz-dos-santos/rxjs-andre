import { of, Subject } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { delay } from "rxjs/operators";
import { mergeMapPause } from "./mergeMapPause";

it(
  `works like mergeMap`,
  marbles(m => {
    const pause$ = new Subject<boolean>();
    const source = m.cold("abc---d|");
    const expected = "     ----ab--c-(d|)";
    const count = m.cold(" ftt-tft-f-f", { t: true, f: false });
    const result = source.pipe(mergeMapPause(addDelay, 1, 2, pause$));
    m.expect(result).toBeObservable(expected);
    m.expect(pause$).toBeObservable(count);

    function addDelay(x: any) {
      return of(x).pipe(delay(m.time("----|")));
    }
  })
);

it(
  `does not emit on pause between min and max concurrent`,
  marbles(m => {
    const pause$ = new Subject<boolean>();
    const source = m.cold("abcde|");
    const expected = "     -------abcd---(e|)";
    const pause = m.cold(" f--tt--t--f---f", { t: true, f: false });
    const result = source.pipe(mergeMapPause(addDelay, 1, 4, pause$));
    m.expect(result).toBeObservable(expected);
    m.expect(pause$).toBeObservable(pause);

    function addDelay(x: any) {
      return of(x).pipe(delay(m.time("-------|")));
    }
  })
);
