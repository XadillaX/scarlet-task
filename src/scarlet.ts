import { EventEmitter } from 'events';

import { TaskObject } from './task-object';

export type TaskProcessor<T> = (task: TaskObject<T>) => void | Promise<void>;
export type AfterFinishProcessor = () => void | Promise<void>;

interface IQueuingItem<T> {
  queueId: number | null;
  task: T;
  processor: TaskProcessor<T>;
}

let asyncRun: (callback: () => any) => void;
if (!globalThis.process?.nextTick) {
  asyncRun = queueMicrotask;
} else {
  asyncRun = process.nextTick.bind(process);
}

/**
 * Scarlet is a task queue that allows you to process tasks in parallel.
 */
export class Scarlet {
  static TaskObject: typeof TaskObject;

  queueCount: number;
  processedCount = 0;

  spouts: (IQueuingItem<any> | null)[] = [];
  running: boolean[] = [];

  queue: IQueuingItem<any>[] = [];
  emitter: EventEmitter = new EventEmitter();

  afterFinishCount = -1;
  afterFinishLoop = false;
  afterFinishProcessor: AfterFinishProcessor | undefined;

  /**
   * Create a new Scarlet instance.
   * @param {number} queueCount The number of queues to create.
   */
  constructor(queueCount = 1) {
    this.queueCount = queueCount;

    for (let i = 0; i < queueCount; i++) {
      this.spouts.push(null);
      this.running.push(false);
    }

    this.emitter.on('done', (queueId: number) => {
      if (queueId >= this.queueCount || queueId < 0) {
        throw new Error(`Invalid queueId, ${queueId} !== ${this.queueCount}`);
      }

      this.spouts[queueId] = null;
      this.processedCount++;

      // Call the `afterFinishProcessor` if it's set.
      let needRunFinishProcessor: boolean;
      if (this.afterFinishLoop) {
        needRunFinishProcessor = !(this.processedCount % this.afterFinishCount);
      } else {
        needRunFinishProcessor = this.processedCount === this.afterFinishCount;
      }

      if (needRunFinishProcessor && this.processedCount !== -1 && typeof this.afterFinishProcessor === 'function') {
        this.afterFinishProcessor();
        if (!this.afterFinishLoop) {
          this.clearAfterFinish();
        }
      }

      asyncRun(() => this.#runTask(queueId));
    });
  }

  /**
   * Get the number of processed tasks.
   * @return {number} The number of processed tasks.
   */
  numberOfProcessed(): number {
    return this.processedCount;
  }

  /**
   * Reset the number of processed tasks.
   */
  resetNumberOfProcessed(): void {
    this.processedCount = 0;
  }

  /**
   * Run a task in a queue.
   * @param {number} queueId The id of the queue to run the task in.
   */
  #runTask(queueId: number) {
    const task = this.queue.shift();

    // If task item is not existing, stop the queue.
    if (task === undefined) {
      this.running[queueId] = false;
      return;
    }

    task.queueId = queueId;
    this.running[queueId] = true;
    this.spouts[queueId] = task;

    const taskObject = new TaskObject(task.task, queueId, this);
    task.processor(taskObject);
  }

  /**
   * Push a task into the queue.
   * @param {T} task The task to push into the queue.
   * @param {TaskProcessor<T>} processor The processor to run the task.
   */
  push<T>(task: T, processor: TaskProcessor<T>): void {
    // Push the task into the queue.
    this.queue.push({ queueId: null, task, processor });

    // Start this task if any queue is stopped.
    for (let i = 0; i < this.queueCount; i++) {
      if (!this.running[i]) {
        this.running[i] = true;
        asyncRun(() => this.#runTask(i));
        break;
      }
    }
  }

  /**
   * Mark a task as done.
   * @param {TaskObject<T>} taskObject The task object to mark as done.
   */
  taskDone<T>(taskObject: TaskObject<T>) {
    if (taskObject.hasDone) return;
    const queueId = taskObject.queueId;
    asyncRun(() => this.emitter.emit('done', queueId));
  }

  /**
   * Set the after finish processor.
   * @param {number} count The number of tasks to process before calling the processor.
   * @param {AfterFinishProcessor} processor The processor to call after the tasks are processed.
   * @param {boolean} loop Whether to loop the after finish processor.
   */
  afterFinish(count: number, processor: AfterFinishProcessor, loop?: boolean) {
    this.afterFinishCount = count;
    this.afterFinishProcessor = processor;
    this.afterFinishLoop = !!loop;
  }

  /**
   * Clear the after finish processor.
   */
  clearAfterFinish() {
    this.afterFinishCount = -1;
    this.afterFinishProcessor = undefined;
    this.afterFinishLoop = false;
  }
}
