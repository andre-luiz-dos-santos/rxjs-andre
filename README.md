# RxJS Tools

## Installation

```
npm install rxjs-andre --save
```

## Goal

Pause the child process stdout when more than 10 slowTask function calls are running simultaneously. Resume stdout when only 5 function calls are still running.

There´s an example in the file `example/pause-1.ts` that uses `/dev/zero` instead of a process.

```typescript
let pause$ = new Subject<boolean>();
let stdout$ = spawnStdout(ssh_tail, { pause$ }).pipe(
  splitString(),
  mergeMapPause(slowTask, 5, 10, pause$)
);
```
