Scarlet Task
============

A task queue module for node.js. You can set several children-queue for one task queue.

Why named Scarlet? ๛ก(ｰ̀ωｰ́ก)
------------

At first, I wrote this module is for searching one song in [萌否收音機](moe.fm). And last I found that song named <[the Embodiment of Scarlet Devil](http://moe.fm/listen?song=79922)>.

For rembembering this and for my favorite [Flandre Scarlet](http://touhou.wikia.com/wiki/Flandre_Scarlet), I named this module `Scarlet Task`.

Usefulness
------------

For one situation, once you want to crawl one website. If you use primitive `node.js`, it will like you're DDOSing that website.

So you need a task queue to help you. It will process tasks in queue one by one.

What's more, you can set that one queue has several children-queue to work concurrently.

And you can use it at any other situation that suitable.

Installation
------------

```shell
$ npm install scarlet-task
```

Tutorials
------------

Require the module at first and instantiate an object.

```javascript
var TaskQueue = require("scarlet-task");
var taskQueue = new TaskQueue(10);
```

> The parameter for `constructor` means number of children-queue. Pass no parameter for default 1 children-queue.

Define a `processor` function for one task. In fact, you can pass an anonymous function.

```javascript
function processor(taskObject) {
	// get task object
    var task = taskObject.task;
    
    // Do something...
    // blahblah...
    
    taskQueue.taskDone(taskObject);
    console.log(taskQueue.numberOfProcessed());
};
```

> ***Notice:*** In the `processor` function, you should call `taskQueue.taskDone(taskObject)` when you think this task is done. And then the `taskQueue` will process next task. The parameter `taskObject` is a parameter that `taskQueue` passed to you.

You can push task(s) at anytime.

The task object can be any type - string, number, json, etc.

```javascript
var task = "it may be a url, or an object that process can do something with this task object.";
taskQueue.push(task, processor);
```

See more reference at `test/touhou.js`.

> What's more, if you want to see the queue status for debuging, you can pass `true` to `taskDone` and `push`.

eg.

```javascript
taskQueue.taskDone(taskObject, true);
taskQueue.push(task, processor, true);
```

You can reset the number of processed tasks as well:

```javascript
taskQueue.resetNumberOfProcessed();
```

And you can set an after-finish function so that Scarlet will call it after a certain number of tasks finished.

```javascript
taskQueue.afterFinish(20, done, false);
// this will call done() after 20 tasks done without loop (means only once unless you reset number of processed).

taskQueue.clearAfterFinish();
// You can clear after finish processor
```

> See more reference at `test/afterfinish.js`.

Author
------------

Only me - XadillaX so far.

You can contribute your code! You're welcome.

「雖然我覺得不怎麼可能有人會關注我」
