const fs = require('fs');
const { JSDOM } = require('jsdom');

// load html
const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

// expose global to simulate browser environment
const window = dom.window;
const document = window.document;

// provide a fake Supabase client so no network call is needed
function createFakeClient() {
  let tasks = [];
  return {
    from: (table) => {
      return {
        select() { return this; },
        async order(field, opts) { return { data: tasks, error: null }; },
        async insert(rows) { tasks.push(...rows); return { error: null }; }
      };
    }
  };
}

// attach fake supabase to window before loading app script
window.supabase = { createClient: () => createFakeClient() };

// load app.js manually
const script = fs.readFileSync('app.js', 'utf-8');
dom.window.eval(script);

// trigger DOMContentLoaded to allow initialization
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

// simulate adding a task inside an async wrapper
(async () => {
  window.document.getElementById('taskInput').value = 'Test task';
  await window.addTask();

  const items = [...document.querySelectorAll('#taskList li')].map(li => li.textContent);
  console.log('Items after addTask:', items);

  if (items.includes('Test task')) {
    console.log('✅ Test passed');
    process.exit(0);
  } else {
    console.error('❌ Test failed');
    process.exit(1);
  }
})();