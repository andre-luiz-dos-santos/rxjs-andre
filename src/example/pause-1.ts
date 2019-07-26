import { createReadStream } from "fs";
import { Subject, timer } from "rxjs";
import { map, mapTo } from "rxjs/operators";
import { fromStream } from "../fromStream";
import { mergeMapPause } from "../mergeMapPause";

let pause$ = new Subject<boolean>();
let buffers = new Set<number>();

let fileStream = createReadStream("/dev/zero");
let file$ = fromStream<Buffer>(fileStream, { pause$ });

file$
  .pipe(
    map(inputStream),
    mergeMapPause(slowTask, 1, 4, pause$)

    // mergeMap(slowTask, 4)
    // Would not stop reading.
  )
  .subscribe(outputStream);

function slowTask(index: number) {
  return timer(Math.random() * 5000).pipe(mapTo(index));
}

function inputStream(buf: Buffer, index: number) {
  buffers.add(index);
  console.log(`%o  [bytes=${buf.length}]`, buffers);
  return index;
}

function outputStream(index: number) {
  buffers.delete(index);
  console.log(`%o`, buffers);
}
