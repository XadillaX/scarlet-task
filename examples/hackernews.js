'use strict';

const spidex = require('spidex');
const { Scarlet } = require('../lib');

const scarlet = new Scarlet(10);

function printTitle(to) {
  spidex.get(`https://hacker-news.firebaseio.com/v0/item/${to.task.id}.json?print=pretty`, html => {
    const json = JSON.parse(html);
    console.log(`[${to.task.type}] ${json.title}`);
    to.done();
  }).on(err => {
    console.error(`Failed to fetch ${to.task.id}`, err);
    to.done();
  });
}

function parseIndex(to) {
  spidex.get(`https://hacker-news.firebaseio.com/v0/${to.task}stories.json?print=pretty`, html => {
    const ids = JSON.parse(html);
    for (const id of ids) {
      scarlet.push({ type: to.task, id }, printTitle);
    }
    to.done();
  }).on(err => {
    console.error(`Failed to fetch ${to.task}`, err);
    to.done();
  });
}

for (const type of [ 'top', 'new', 'best' ]) {
  scarlet.push(type, parseIndex);
}
