import { Scarlet } from './scarlet';

export class TaskObject<T> {
  queueId: number;
  task: T;
  #scarlet: Scarlet;
  hasDone = false;

  constructor(task: T, queueId: number, scarlet: Scarlet) {
    this.queueId = queueId;
    this.task = task;
    this.#scarlet = scarlet;
  }

  done(debugStr?: boolean) {
    if (this.hasDone) return;
    this.#scarlet.taskDone(this, debugStr);
    this.hasDone = true;
  }
}
