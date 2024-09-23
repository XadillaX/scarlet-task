import { Scarlet } from '../src/scarlet';
import { spy } from 'sinon';
import { TaskObject } from '../src/task-object';

describe('🧩 TaskObject', () => {
  let scarlet: Scarlet;
  let taskObject: TaskObject<{ id: number }>;

  beforeEach(() => {
    scarlet = new Scarlet(1);
    taskObject = new TaskObject({ id: 1 }, 0, scarlet);
  });

  it('🏗️ should correctly initialize properties', () => {
    taskObject.task.should.deepEqual({ id: 1 });
    taskObject.queueId.should.equal(0);
    taskObject.hasDone.should.be.false();
  });

  it('✅ should correctly mark task as done', () => {
    const taskDoneSpy = spy(scarlet, 'taskDone');

    taskObject.done();

    taskObject.hasDone.should.be.true();
    taskDoneSpy.calledWith(taskObject).should.be.true();

    // Calling done method again should have no effect
    taskDoneSpy.resetHistory();
    taskObject.done();
    taskDoneSpy.called.should.be.false();
  });
});
