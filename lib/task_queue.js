/**
 * XadillaX created at 2014-05-07 03:48:21 With ♥
 *
 * Copyright (c) 2016 XadillaX, all rights
 * reserved.
 */
var EventEmitter = require("events").EventEmitter;

var nextTick = global.setImmediate === undefined ? process.nextTick : global.setImmediate;

/**
 * TaskQueue
 * @constructor
 * @param {Number} queueCount the queue count
 */
var TaskQueue = function(queueCount) {
    var self = this;
    this.queueCount = queueCount;
    this.emitter = new EventEmitter();
    this.processedCount = 0;

    // we assume the queue count is 1
    // if developer pass no `queueCount`
    // param
    if(undefined === queueCount) {
        this.queueCount = 1;
    }

    // The listener of task done
    this.emitter.on("done", function(queueId, debugStr) {
        queueId = parseInt(queueId);
        if(isNaN(queueId)) return;
        if(queueId >= self.queueCount || queueId < 0) return;

        if(debugStr) {
            var logStr = "( Done: ";
            for(var i = 0; i < self.queue.length; i++) {
                if(i !== 0) logStr += ", ";
                logStr += "[" + self.queue[i].length + "]";
            }
            logStr += " )";
            console.log(logStr);
        }

        nextTick(function() {
            self._runTask(queueId);
        });
    });

    // initialize the tast queue into a
    // two-dimensional array
    this.queue = [];
    this.running = [];
    for(var i = 0; i < this.queueCount; i++) {
        this.queue.push([]);
        this.running.push(false);
    }

    // after finish
    this.afterFinishCount = -1;
    this.afterFinishLoop = false;
    this.afterFinishProcessor = undefined;
};

/**
 * numberOfProcessed
 */
TaskQueue.prototype.numberOfProcessed = function() {
    return this.processedCount;
};

/**
 * resetNumberOfProcessed
 */
TaskQueue.prototype.resetNumberOfProcessed = function() {
    this.processedCount = 0;
};

/**
 * _runTask
 * @param {Number} queueId the queue id
 * @private
 */
TaskQueue.prototype._runTask = function(queueId) {
    // no task in this queue.
    if(!this.queue[queueId].length) {
        this.running[queueId] = false;
        return;
    }

    this.running[queueId] = true;

    // get the task.
    var task = this.queue[queueId].shift();

    // run this task.
    task.processor({ queueId: queueId, task: task.task });

    task.processor = undefined;
    task.task = undefined;
};

/**
 * push
 * @param {Object} task a task sign - it can be a string, number, etc.
 * @param {Function} processor the processor to process this task. it will be called like `processor(task)`
 * @param {Boolean} [debugStr] if true, then it will print the debug string to the `stdout`
 */
TaskQueue.prototype.push = function(task, processor, debugStr) {
    // choose a minimum queue
    var min = 0;
    for(var i = 1; i < this.queueCount; i++) {
        if(this.queue[i].length < this.queue[min].length) {
            min = i;
        }
    }

    // push the task into queue
    this.queue[min].push({
        queueId     : min,
        task        : task,
        processor   : processor
    });

    if(debugStr) {
        var logStr = "( Pushed: ";
        for(var i = 0; i < this.queue.length; i++) {
            if(i !== 0) logStr += ", ";
            logStr += "[" + this.queue[i].length + "]";
        }
        logStr += " )";
        console.log(logStr);
    }

    // when no task running in this queue,
    // run the task.
    var self = this;
    if(!this.running[min]) {
        this.running[min] = true;
        nextTick(function() {
            self._runTask(min);
        });
    }
};

/**
 * taskDone
 *     This function will be called in the `processor` when the
 *     processor done every thing for one task.
 * @param {Object} taskObject the task object passed in `processor`
 * @param {Boolean} [debugStr] if true, then it will print the debug string to the `stdout`
 */
TaskQueue.prototype.taskDone = function(taskObject, debugStr) {
    var self = this;

    nextTick(function() {
        self.emitter.emit("done", taskObject.queueId, debugStr);
    });

    this.processedCount++;

    // after finish
    var needRunFinish = false;
    if(this.afterFinishLoop) needRunFinish = !(this.processedCount % this.afterFinishCount); // jshint ignore: line
    else needRunFinish = (this.processedCount === this.afterFinishCount);
    if(needRunFinish && this.processedCount !== -1 && typeof this.afterFinishProcessor === "function") {
        this.afterFinishProcessor();
        if(!this.afterFinishLoop) this.clearAfterFinish();
    }
};

/**
 * afterFinish
 * @param {Number} count finished count to call the processor
 * @param {Function} processor the processor will be called
 * @param {Boolean} [loop] if it will be loop
 */
TaskQueue.prototype.afterFinish = function(count, processor, loop) {
    this.afterFinishCount = count;
    this.afterFinishLoop = !!loop;
    this.afterFinishProcessor = processor;
};

/**
 * clearAfterFinish
 */
TaskQueue.prototype.clearAfterFinish = function() {
    this.afterFinishCount = -1;
    this.afterFinishLoop = false;
    this.afterFinishProcessor = undefined;
};

module.exports = TaskQueue;
