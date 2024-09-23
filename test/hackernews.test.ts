import 'should';
import { Scarlet } from '../src';
import spidex from 'spidex';

describe('🗞️ Hacker News Integration Test', function() {
  this.timeout(30000); // Increase timeout to 30 seconds for network requests
  let scarlet: Scarlet;
  const expectedStories = 15; // Expected number of stories
  let actualStories = 0;

  beforeEach(() => {
    scarlet = new Scarlet(10);
    actualStories = 0;
  });

  function printTitle(to: any) {
    console.log(`[DEBUG] Fetching title for ${to.task.type} story ${to.task.id}`);
    spidex.get(`https://hacker-news.firebaseio.com/v0/item/${to.task.id}.json?print=pretty`, (html: string) => {
      const json = JSON.parse(html);
      console.log(`[${to.task.type}] ${json.title}`);
      console.log(`[DEBUG] Finished fetching title for ${to.task.type} story ${to.task.id}`);
      actualStories++;
      to.done();
    }).on('error', (err: Error) => {
      console.error(`Failed to fetch ${to.task.id}`, err);
      console.log(`[DEBUG] Error fetching title for ${to.task.type} story ${to.task.id}`);
      to.done();
    });
  }

  function parseIndex(to: any) {
    console.log(`[DEBUG] Fetching index for ${to.task} stories`);
    spidex.get(`https://hacker-news.firebaseio.com/v0/${to.task}stories.json?print=pretty`, (html: string) => {
      const ids = JSON.parse(html);
      const slicedIds = ids.slice(0, 5);
      console.log(`[DEBUG] Fetched ${slicedIds.length} ${to.task} story IDs`);
      slicedIds.forEach((id: number) => {
        console.log(`[DEBUG] Pushing task for ${to.task} story ${id}`);
        scarlet.push({ type: to.task, id }, printTitle);
      });
      console.log(`[DEBUG] Finished parsing index for ${to.task} stories`);
      to.done();
    }).on('error', (err: Error) => {
      console.error(`Failed to fetch ${to.task}`, err);
      console.log(`[DEBUG] Error fetching index for ${to.task} stories`);
      to.done();
    });
  }

  it('🌐 should fetch and print stories from all categories', done => {
    console.log('[DEBUG] Starting test');
    [ 'top', 'new', 'best' ].forEach(type => {
      console.log(`[DEBUG] Pushing task for ${type} stories`);
      scarlet.push(type, parseIndex);
    });

    scarlet.afterFinish(18, () => { // 3 initial tasks + 15 expected stories
      console.log('[DEBUG] All tasks finished');
      console.log(`Total stories fetched: ${actualStories}`);
      console.log(`[DEBUG] Expected stories: ${expectedStories}, Actual stories: ${actualStories}`);
      console.log('[DEBUG] Test finished');
      actualStories.should.be.exactly(expectedStories);
      done();
    });
  });
});
