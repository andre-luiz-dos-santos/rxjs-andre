import { of } from "rxjs";
import { toArray } from "rxjs/operators";
import { splitString } from "./splitString";

test(`Split string with default options`, async () => {
  expect(
    await of("a", "b", "c\n", "\nd", "x\n\n", "tail")
      .pipe(
        splitString(),
        toArray()
      )
      .toPromise()
  ).toEqual(["abc", "", "dx", "", "tail"]);
});

test(`Do not emit the tail`, async () => {
  expect(
    await of("abc\ntail")
      .pipe(
        splitString({ emitTail: false }),
        toArray()
      )
      .toPromise()
  ).toEqual(["abc"]);
});
