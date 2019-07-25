import { empty, from, Observable, ObservableInput, Subject } from "rxjs";
import { audit, concatMap, finalize } from "rxjs/operators";

export function auditMap<T, R>(
  project: (sourceValue: T) => ObservableInput<R>
) {
  return function(source: Observable<T>) {
    return new Observable<R>(subscriber => {
      let isRunning = false;
      const wait$ = new Subject();

      return source
        .pipe(
          audit(timer),
          concatMap(run)
        )
        .subscribe(subscriber);

      function timer() {
        return isRunning ? wait$ : empty();
      }

      function run(value: T) {
        isRunning = true;
        return from(project(value)).pipe(
          finalize(() => {
            isRunning = false;
            wait$.next();
          })
        );
      }
    });
  };
}
