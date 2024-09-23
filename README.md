<p align="center">
  <img src="scarlet.gif" alt="Scarlet Task">
</p>

<h1 align="center">Scarlet Task</h1>

<p align="center">
  <a href="https://coveralls.io/github/XadillaX/scarlet-task?branch=master">
    <img src="https://coveralls.io/repos/github/XadillaX/scarlet-task/badge.svg?branch=master" alt="Coverage Status">
  </a>
  <a href="https://github.com/XadillaX/scarlet-task/actions">
    <img src="https://github.com/XadillaX/scarlet-task/workflows/Node.js%20CI/badge.svg" alt="Build Status">
  </a>
</p>

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

First, require the module and instantiate a Scarlet object:

```javascript
const { Scarlet } = require("scarlet-task");
const scarlet = new Scarlet(10);
```

> The parameter for the `constructor` represents the number of child queues. If no parameter is passed, it defaults to 1 child queue.

Define a `processor` function to handle tasks. You can also pass an anonymous function:

```javascript
function processor(taskObject) {
  // Get the task object
  const task = taskObject.task;
  
  // Perform task logic...
  // ...
  
  taskObject.done(); // Or call `scarlet.taskDone(taskObject);`

  console.log(scarlet.numberOfProcessed());
}
```

> **Note:** In the `processor` function, you should call `taskObject.done()` or `scarlet.taskDone(taskObject)` when you consider the task complete. Then `scarlet` will process the next task. The `taskObject` parameter is passed to you by the `scarlet` instance.

You can push tasks into the queue at any time. The task object can be of any type - string, number, JSON, etc.:

```javascript
const task = "This could be a URL, or an object that the processor can handle";
scarlet.push(task, processor);
```

For more reference, see `test/hackernews.test.ts`.

You can reset the number of processed tasks:

```javascript
scarlet.resetNumberOfProcessed();
```

You can also set an after-finish callback function that Scarlet will call after a specified number of tasks are completed:

```javascript
scarlet.afterFinish(20, done, false);
// This will call done() after 20 tasks are completed, without looping (meaning it executes only once unless you reset the processed count)

scarlet.clearAfterFinish();
// You can clear the afterFinish processor
```

> For more reference, see `test/hackernews.test.ts`.

## APIs

### `Scarlet`

#### Constructor

```javascript
const scarlet = new Scarlet(queueCount);
```

- `queueCount` (optional): Number of child queues. Defaults to 1 if not specified.

#### Methods

- `push(task, processor)`: Adds a new task to the queue.
  - `task`: The task to be processed (can be any type).
  - `processor`: Function to process the task.

- `numberOfProcessed()`: Returns the number of processed tasks.

- `resetNumberOfProcessed()`: Resets the count of processed tasks to 0.

- `taskDone(taskObject)`: Marks a task as completed.
  - `taskObject`: The task object to be marked as done.

- `afterFinish(count, processor, loop)`: Sets a callback to be executed after a certain number of tasks are completed.
  - `count`: Number of tasks to complete before calling the processor.
  - `processor`: Function to be called after `count` tasks are completed.
  - `loop` (optional): If true, the processor will be called repeatedly every `count` tasks. Defaults to false.

- `clearAfterFinish()`: Clears the after-finish processor.

### `TaskObject`

#### Properties

- `task`: The task data.
- `queueId`: The ID of the queue processing this task.

#### Methods

- `done()`: Marks the task as completed.

## Contribute

You're welcome to make pull requests!

「雖然我覺得不怎麼可能有人會關注我」
