import { cold, Scheduler } from "jest-marbles";
import { of } from "rxjs";
import { delay, exhaustMap } from "rxjs/operators";
import { auditMap } from "./auditMap";

function addDelay(x: any) {
  return of(x).pipe(delay(50, Scheduler.get()));
}

test(`source is active the whole time`, () => {
  const source = cold("-abc----------|");
  const audit = "      ------a----c--|";
  const exhaust = "    ------a-------|";
  expect(source.pipe(auditMap(addDelay))).toBeMarble(audit);
  expect(source.pipe(exhaustMap(addDelay))).toBeMarble(exhaust);
});

test(`source completes before c is done`, () => {
  const source = cold("-abc-----|");
  const audit = "      ------a----(c|)";
  const exhaust = "    ------a--|";
  expect(source.pipe(auditMap(addDelay))).toBeMarble(audit);
  expect(source.pipe(exhaustMap(addDelay))).toBeMarble(exhaust);
});

test(`source completes before a is done`, () => {
  const source = cold("-abc-|");
  const expected = "   ------(a|)";
  expect(source.pipe(auditMap(addDelay))).toBeMarble(expected);
  expect(source.pipe(exhaustMap(addDelay))).toBeMarble(expected);
});
