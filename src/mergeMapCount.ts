import { from, ObservableInput, pipe, Subject } from "rxjs";
import { finalize, mergeMap, tap } from "rxjs/operators";

export function mergeMapCount<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  concurrent: number,
  count$: Subject<number>
) {
  let runningCount = 0;

  return pipe(
    tap<T>(incrementCounter),
    mergeMap(run, concurrent)
  );

  function run(value: T, index: number) {
    return from(project(value, index)).pipe(finalize(decrementCounter));
  }

  function incrementCounter() {
    count$.next(++runningCount);
  }

  function decrementCounter() {
    count$.next(--runningCount);
  }
}
