import { EventEmitter } from 'events';

import { TaskObject } from './task_object';

export type TaskProcessor<T> = (task: TaskObject<T>) => void | Promise<void>;
export type AfterFinishProcessor = () => void | Promise<void>;

interface IQueuingItem<T> {
  queueId: number;
  task: T;
  processor: TaskProcessor<T>;
}
type IQueuingItemArray<T> = IQueuingItem<T>[];

let asyncRun: (callback: () => any) => void;
if (!globalThis.process?.nextTick) {
  asyncRun = queueMicrotask;
} else {
  asyncRun = process.nextTick.bind(process);
}

export class Scarlet {
  static TaskObject: typeof TaskObject;

  queueCount: number;
  processedCount = 0;
  queue: IQueuingItemArray<any>[] = [];
  running: boolean[] = [];
  emitter: EventEmitter = new EventEmitter();

  afterFinishCount = -1;
  afterFinishLoop = false;
  afterFinishProcessor: AfterFinishProcessor | undefined;

  constructor(queueCount = 1) {
    this.queueCount = queueCount;

    for (let i = 0; i < queueCount; i++) {
      this.queue.push([]);
      this.running.push(false);
    }

    this.emitter.on('done', (queueId: number, debugStr: boolean) => {
      if (queueId >= this.queueCount || queueId < 0) {
        throw new Error(`Invalid queueId, ${queueId} !== ${this.queueCount}`);
      }

      if (debugStr) {
        console.log(`Scarlet done (${this.queue.map(q => q.length).join(', ')})`);
      }

      asyncRun(() => {
        this.#runTask(queueId);
      });
    });
  }

  numberOfProcessed(): number {
    return this.processedCount;
  }

  resetNumberOfProcessed(): void {
    this.processedCount = 0;
  }

  #runTask(queueId: number) {
    const queue = this.queue[queueId];

    // If empty
    if (queue.length === 0) {
      this.running[queueId] = false;
      return;
    }

    this.running[queueId] = true;

    // Get the task
    const task = queue.shift() as IQueuingItem<any>;

    if (task.queueId !== queueId) {
      throw new Error(`Invalid queueId, ${task.queueId} !== ${queueId}`);
    }

    const taskObject = new TaskObject(task.task, queueId, this);
    task.processor(taskObject);
  }

  push<T>(task: T, processor: TaskProcessor<T>, debugStr?: boolean): void {
    // Choose a minimun queue
    let min = 0;
    for (let i = 0; i < this.queueCount; i++) {
      if (this.queue[i].length < this.queue[min].length) {
        min = i;
      }
    }

    // Push the task into the queue
    this.queue[min].push({
      queueId: min,
      task,
      processor,
    });

    if (debugStr) {
      console.log(`Scarlet pushed (${this.queue.map(q => q.length).join(', ')})`);
    }

    // Start the queue if it's not running
    if (!this.running[min]) {
      this.running[min] = true;
      asyncRun(() => {
        this.#runTask(min);
      });
    }
  }

  taskDone<T>(taskObject: TaskObject<T>, debugStr?: boolean) {
    if (taskObject.hasDone) return;

    asyncRun(() => {
      this.emitter.emit('done', taskObject.queueId, !!debugStr);
    });

    this.processedCount++;

    // Call the afterFinishProcessor if it's set
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
  }

  afterFinish(count: number, processor: AfterFinishProcessor, loop?: boolean) {
    this.afterFinishCount = count;
    this.afterFinishProcessor = processor;
    this.afterFinishLoop = !!loop;
  }

  clearAfterFinish() {
    this.afterFinishCount = -1;
    this.afterFinishProcessor = undefined;
    this.afterFinishLoop = false;
  }
}
