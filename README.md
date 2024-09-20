# Scarlet Task

![Flandre Scarlet](scarlet.gif)

Scarlet Task is an advanced task queue module for Node.js, featuring the ability to configure multiple child queues for
a single task queue.

## Why named Scarlet? ๛ก(ｰ̀ωｰ́ก)

The story behind this module's name is quite serendipitous. One day, while browsing [萌否收音機](https://moe.fm), I
stumbled upon a captivating song. Though its title slipped my mind, I distinctly remembered its considerable length.

Driven by a desire to rediscover this elusive track, I developed this queue module. It allowed me to perform an
exhaustive search across the entire Moe FM platform. After a thorough exploration, I finally unearthed the song that had
been haunting my memory: <[the Embodiment of Scarlet Devil](https://moe.fm/listen?song=79922)>.

To commemorate this musical treasure hunt and pay homage to my favorite character,
[Flandre Scarlet](http://touhou.wikia.com/wiki/Flandre_Scarlet), I christened this module 'Scarlet Task'.
It's a nod to both the journey of rediscovery and the Scarlet-themed song that sparked it all.

## Use Case

Scarlet Task is particularly useful for scenarios requiring controlled asynchronous operations, such as web crawling. By
allowing you to set up multiple child queues, it enables concurrent processing while maintaining control over
parallelism, preventing issues like unintentional DDoS-like behavior on target websites.

## Installation

```shell
$ npm install --save scarlet-task
```

If you're using it in browser, you may need to install `events` as well.

```shell
$ npm install --save events
```

## Tutorials

Require the module at first and instantiate an object.

```javascript
var { Scarlet } = require("scarlet-task");
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
  
  taskObject.done(); // You can call `taskQueue.taskDone(taskObject);` either

  console.log(taskQueue.numberOfProcessed());
};
```

> ***Notice:*** In the `processor` function, you should call `taskObject.done()` or `taskQueue.taskDone(taskObject)`
> when you think this task is done. And then the `taskQueue` will process next task. The parameter `taskObject` is a
> parameter that `taskQueue` passed to you.

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
taskObject.done(true); // or `taskQueue.taskDone(taskObject, true);`
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

> See more reference at `examples/hackernews.js`.

## Migrate From v1.x to v2.x

`scarlet-task` v1.x exports `Scarlet` directly:

```js
const Scarlet = require('scarlet-task');
```

While v2.x exports like this:

```js
const { Scarlet } = require('scarlet-task');
```

Just replace the requirement.

## Contribute

You're welcome to make pull requests!

「雖然我覺得不怎麼可能有人會關注我」
