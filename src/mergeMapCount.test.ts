import { of, Subject } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { delay, map } from "rxjs/operators";
import { mergeMapCount } from "./mergeMapCount";

it(
  `works like mergeMap`,
  marbles(m => {
    const count$ = new Subject<number>();
    const source = m.cold("abc---d|");
    const expected = "     ----ab--c-(d|)";
    const count = m.cold(" 123-212-1-0");
    const result = source.pipe(mergeMapCount(addDelay, 2, count$));
    m.expect(result).toBeObservable(expected);
    m.expect(count$.pipe(map(x => x.toString()))).toBeObservable(count);

    function addDelay(x: any) {
      return of(x).pipe(delay(m.time("----|")));
    }
  })
);
