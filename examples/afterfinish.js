'use strict';

const { Scarlet } = require('../lib');
const taskQueue = new Scarlet(10);

function process(to) {
  console.log(`Doing task [${to.task}]...`);
  to.done();
}

taskQueue.afterFinish(20, function() {
  console.log('All finished...');
});

for (let i = 0; i < 20; i++) {
  taskQueue.push(i, process);
}
