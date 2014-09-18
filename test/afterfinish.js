/**
 * XadillaX created at 2014-09-18 15:31
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var TaskQueue = require("../");
var taskQueue = new TaskQueue(10);

function process(TO) {
    console.log("Doing task [" + TO.task + "]...");
    taskQueue.taskDone(TO);
}

taskQueue.afterFinish(20, function() {
    console.log("All finished...");
});

for(var i = 0; i < 20; i++) {
    taskQueue.push(i, process);
}
