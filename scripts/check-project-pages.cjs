const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let checked = 0;
for (const file of ['public/index.html', 'public/project-khai-hoan.html', 'public/sao-ke.html']) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate id: ' + file);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|mailto:|tel:)/.test(url)) continue;
    if (url.startsWith('#')) {
      if (!ids.includes(url.slice(1))) throw Error('Missing anchor: ' + url);
    } else {
      const target = path.resolve(path.dirname(file), url.split('#')[0]);
      if (!fs.existsSync(target)) throw Error('Missing local file: ' + target);
    }
    checked++;
  }
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
  console.log(file + ': links, anchors and inline JavaScript OK');
}
console.log(checked + ' local references verified');
