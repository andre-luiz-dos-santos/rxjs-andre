import { from, ObservableInput, pipe, Subject } from "rxjs";
import { finalize, mergeMap, tap } from "rxjs/operators";

export function mergeMapPause<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  minConcurrent: number,
  maxConcurrent: number,
  pause$: Subject<boolean>
) {
  let runningCount = 0;

  return pipe(
    tap<T>(incrementCounter),
    mergeMap(run, maxConcurrent)
  );

  function run(value: T, index: number) {
    return from(project(value, index)).pipe(finalize(decrementCounter));
  }

  function incrementCounter() {
    runningCount++;
    nextPause();
  }

  function decrementCounter() {
    runningCount--;
    nextPause();
  }

  function nextPause() {
    if (runningCount <= minConcurrent) {
      pause$.next(false);
    } else if (runningCount >= maxConcurrent) {
      pause$.next(true);
    }
  }
}
