import 'should';
import * as sinon from 'sinon';
import { Scarlet, TaskObject } from '../src';

describe('🎭 Scarlet', () => {
  let scarlet: Scarlet;

  beforeEach(() => {
    scarlet = new Scarlet(2);
  });

  describe('Initialization and Configuration', () => {
    it('🚀 should correctly initialize queue count', () => {
      scarlet.queueCount.should.equal(2);
      scarlet.spouts.should.have.length(2);
      scarlet.running.should.have.length(2);
    });

    it('🛠️ should initialize with default queue count', () => {
      const defaultScarlet = new Scarlet();
      defaultScarlet.queueCount.should.equal(1);
      defaultScarlet.spouts.should.have.length(1);
      defaultScarlet.running.should.have.length(1);
    });

    it('🛠️ should initialize with valid queue counts', () => {
      const scarlet1 = new Scarlet(1);
      scarlet1.queueCount.should.equal(1);

      const scarlet5 = new Scarlet(5);
      scarlet5.queueCount.should.equal(5);
    });

    it('🛠️ should handle invalid queue count', () => {
      (() => new Scarlet(0)).should.throw(/Invalid queueCount/);
      (() => new Scarlet(-1)).should.throw(/Invalid queueCount/);
      (() => new Scarlet(1.5)).should.throw(/Invalid queueCount/);
    });
  });

  describe('Basic Functionality', () => {
    it('📥 should correctly add and process tasks', done => {
      const task = { id: 1 };
      scarlet.push(task, taskObj => {
        taskObj.task.should.deepEqual(task);
        taskObj.queueId.should.be.oneOf([ 0, 1 ]);
        taskObj.done();
      });

      setTimeout(() => {
        scarlet.numberOfProcessed().should.equal(1);
        done();
      }, 100);
    });

    it('🔄 should correctly reset processed count', () => {
      scarlet.processedCount = 5;
      scarlet.resetNumberOfProcessed();
      scarlet.numberOfProcessed().should.equal(0);
    });
  });

  describe('Task Processing', () => {
    it('📊 should handle pushing tasks when queue is full', done => {
      const scarlet = new Scarlet(1);
      let executedTasks = 0;

      const taskProcessor = (taskObj: any) => {
        setTimeout(() => {
          executedTasks++;
          console.log(`Task ${executedTasks} executed`);
          taskObj.done();
        }, 10);
      };

      scarlet.push({ id: 1 }, taskProcessor);
      scarlet.push({ id: 2 }, taskProcessor);
      scarlet.push({ id: 3 }, taskProcessor);

      // Use afterFinish to check if all tasks are completed
      scarlet.afterFinish(3, () => {
        console.log(`All tasks completed. Processed count: ${scarlet.numberOfProcessed()}`);
        scarlet.numberOfProcessed().should.equal(3);
        executedTasks.should.equal(3);
        done();
      });
    });

    it('🔄 should handle pushing tasks when all queues are running', done => {
      const scarlet = new Scarlet(2);
      let executedTasks = 0;

      const taskProcessor = (taskObj: any) => {
        setTimeout(() => {
          executedTasks++;
          taskObj.done();
        }, 20);
      };

      scarlet.push({ id: 1 }, taskProcessor);
      scarlet.push({ id: 2 }, taskProcessor);

      // Ensure the first two tasks have started executing
      setTimeout(() => {
        scarlet.push({ id: 3 }, taskProcessor);

        // Use afterFinish to ensure all tasks are completed
        scarlet.afterFinish(3, () => {
          console.log(`All tasks completed. Processed count: ${scarlet.numberOfProcessed()}`);
          scarlet.numberOfProcessed().should.equal(3);
          executedTasks.should.equal(3);
          done();
        });
      }, 10);
    });
  });

  describe('Advanced Features', () => {
    it('🔄 should correctly execute afterFinish method', done => {
      let afterFinishCalled = 0;
      scarlet.afterFinish(2, () => {
        afterFinishCalled++;
      });

      scarlet.push({ id: 1 }, taskObj => taskObj.done());
      scarlet.push({ id: 2 }, taskObj => taskObj.done());
      scarlet.push({ id: 3 }, taskObj => taskObj.done());

      setTimeout(() => {
        afterFinishCalled.should.equal(1);
        scarlet.numberOfProcessed().should.equal(3);
        done();
      }, 100);
    });

    it('🔁 should handle afterFinish with loop', done => {
      const scarlet = new Scarlet(2);
      let afterFinishCount = 0;

      scarlet.afterFinish(2, () => {
        afterFinishCount++;
        if (afterFinishCount === 2) {
          done();
        }
      }, true);

      for (let i = 0; i < 4; i++) {
        scarlet.push({ id: i }, taskObj => taskObj.done());
      }
    });

    it('🧹 should correctly clear afterFinish', done => {
      const scarlet = new Scarlet(2);
      let afterFinishCalled = false;

      scarlet.afterFinish(2, () => {
        afterFinishCalled = true;
      });

      scarlet.clearAfterFinish();

      scarlet.push({ id: 1 }, taskObj => taskObj.done());
      scarlet.push({ id: 2 }, taskObj => taskObj.done());

      setTimeout(() => {
        afterFinishCalled.should.be.false();
        scarlet.numberOfProcessed().should.equal(2);
        done();
      }, 50);
    });

    it('🔄 should not execute afterFinishProcessor when processedCount is -1', done => {
      const scarlet = new Scarlet(1);
      let afterFinishCalled = false;

      scarlet.afterFinish(1, () => {
        afterFinishCalled = true;
      });

      // Manually set processedCount to -1
      (scarlet as any).processedCount = -1;

      scarlet.push({ id: 1 }, taskObj => taskObj.done());

      setTimeout(() => {
        afterFinishCalled.should.be.false();
        done();
      }, 50);
    });

    it('🔁 should execute afterFinishProcessor multiple times when loop is true', done => {
      const scarlet = new Scarlet(1);
      let afterFinishCount = 0;
      let isDone = false;

      scarlet.afterFinish(2, () => {
        afterFinishCount++;
        if (afterFinishCount === 3 && !isDone) {
          isDone = true;
          done();
        }
      }, true);

      for (let i = 0; i < 6; i++) {
        scarlet.push({ id: i }, taskObj => taskObj.done());
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('🔒 should not emit done event more than once for the same task', done => {
      const scarlet = new Scarlet(1);
      const emitSpy = sinon.spy(scarlet.emitter, 'emit');

      const taskObject = new TaskObject({ id: 1 }, 0, scarlet);

      scarlet.taskDone(taskObject);
      scarlet.taskDone(taskObject); // Second call should have no effect

      setTimeout(() => {
        sinon.assert.calledOnceWithExactly(emitSpy, 'done', 0);
        scarlet.numberOfProcessed().should.equal(1);
        emitSpy.restore();
        done();
      }, 50);
    });

    it('🔒 should not process task.done() more than once synchronously', done => {
      const scarlet = new Scarlet(1);
      let processCount = 0;

      scarlet.push({ id: 1 }, taskObj => {
        processCount++;
        taskObj.done(); // First call to done()
        taskObj.done(); // Second call to done() should have no effect
        processCount.should.equal(1);

        // Use setTimeout to check the result after the task has been processed
        setTimeout(() => {
          scarlet.numberOfProcessed().should.equal(1);
          done();
        }, 0);
      });
    });

    it('🔒 should not process taskDone more than once for the same task', done => {
      const scarlet = new Scarlet(1);
      const emitSpy = sinon.spy(scarlet.emitter, 'emit');

      const taskObject = new TaskObject({ id: 1 }, 0, scarlet);

      scarlet.taskDone(taskObject);
      scarlet.taskDone(taskObject); // Second call should have no effect

      setTimeout(() => {
        sinon.assert.calledOnceWithExactly(emitSpy, 'done', 0);
        scarlet.numberOfProcessed().should.equal(1);
        emitSpy.restore();
        done();
      }, 50);
    });

    it('🚫 should throw an error for invalid queueId', done => {
      const scarlet = new Scarlet(2);

      try {
        // This should throw an error
        (scarlet as any).emitter.emit('done', 3);
      } catch (error: unknown) {
        if (error instanceof Error) {
          error.message.should.match(/Invalid queueId/);
          done();
        } else {
          done(new Error('Expected an Error to be thrown'));
        }
      }
    });

    it('🚀 should handle many async tasks with small queue size', done => {
      const queueSize = 5;
      const taskCount = 100;
      const minDelay = 10;
      const asyncScarlet = new Scarlet(queueSize);

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const tasks = Array.from({ length: taskCount }, (_, i) => i);
      const results: number[] = [];
      const startTime = Date.now();

      asyncScarlet.afterFinish(taskCount, () => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        asyncScarlet.numberOfProcessed().should.equal(taskCount);
        results.should.have.length(taskCount);
        results.sort((a, b) => a - b).should.deepEqual(tasks);

        totalTime.should.be.aboveOrEqual(minDelay);

        done();
      });

      tasks.forEach(task => {
        asyncScarlet.push(task, async taskObj => {
          await delay(minDelay);
          results.push(taskObj.task);
          taskObj.done();
        });
      });
    });
  });
});
