export interface TaskObject {
  queueId: number;
  task: any;
  done(debugStr?: boolean): void;
}

export default class TaskQueue {
  constructor(queueCount: number);

  numberOfProcessed(): number;
  resetNumberOfProcessed(): void;

  push(task: any, processor: (to: TaskObject) => void, debugStr?: boolean): void;
  taskDone(taskObject: TaskObject, debugStr?: boolean): void;

  afterFinish(count: number, processor: () => void, loop?: boolean): void;
  clearAfterFinish(): void;
}
