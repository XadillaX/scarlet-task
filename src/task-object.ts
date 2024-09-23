import { Scarlet } from './scarlet';

/**
 * The task object that is passed to the processor.
 */
export class TaskObject<T> {
  queueId: number;
  task: T;
  #scarlet: Scarlet;
  hasDone = false;

  /**
   * Create a new task object.
   * @param {T} task The task to be processed.
   * @param {number} queueId The id of the queue that the task is in.
   * @param {Scarlet} scarlet The scarlet instance that the task is in.
   */
  constructor(task: T, queueId: number, scarlet: Scarlet) {
    this.queueId = queueId;
    this.task = task;
    this.#scarlet = scarlet;
  }

  /**
   * Mark the task as done.
   */
  done() {
    if (this.hasDone) return;
    this.#scarlet.taskDone(this);
  }
}
