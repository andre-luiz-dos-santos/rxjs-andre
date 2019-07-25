import { readFileSync } from "fs";
import { BehaviorSubject, merge, Subject, timer } from "rxjs";
import { take, toArray } from "rxjs/operators";
import { spawnStdout } from "./spawnStdout";
import { splitString } from "./splitString";

test(`cat this file`, async () => {
  const cat = await spawnStdout(["cat", __filename])
    .pipe(
      splitString(),
      toArray()
    )
    .toPromise();
  const read = readFileSync(__filename, { encoding: "utf-8" })
    .trim()
    .split("\n");
  expect(cat).toEqual(read);
});

test(`cat stdin`, async () => {
  const a = await spawnStdout(["cat"], { stdin: "abc" }).toPromise();
  expect(a).toEqual("abc");
});

test(`cat non-existent file`, async () => {
  const cat = spawnStdout(["cat", "nonexistent_file"]).toPromise();
  await expect(cat).rejects.toThrow(/\bcat: exit code=1 signal=null\b/);
});

test(`pause$`, async () => {
  const pause$ = new BehaviorSubject(true);
  const stdout$ = new Subject();
  const subscription = spawnStdout(["yes", "x"], { pause$ })
    .pipe(splitString())
    .subscribe(stdout$);
  await timer(100).toPromise();
  const test$ = merge(stdout$, timer(1000)).pipe(take(1));
  expect(await test$.toPromise()).toEqual(0);
  pause$.next(false);
  expect(await test$.toPromise()).toEqual("x");
  subscription.unsubscribe();
});
