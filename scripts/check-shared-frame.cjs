const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const names = ['yfest','sinhnhat-2025','gift-sh','mtpe','sky13','streaming-2025','le','donate'];
for (const name of names) {
  const path = `public/project-${name}.html`;
  const html = fs.readFileSync(path, 'utf8');
  assert.equal((html.match(/src="assets\/js\/project-frame.js"/g) || []).length, 1);
  assert.equal((html.match(/href="assets\/css\/project-frame.css"/g) || []).length, 1);
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1], {filename:path});
  console.log(`${path}: shared frame and script syntax OK`);
}
for (const file of ['pr1','pr2','pr3','pr4','pr5','pr6','pr_le']) assert.ok(fs.existsSync(`public/images/thumbnail/${file}.jpg`));
for (const [folder,count,prefix] of [['pr1',6,'stage'],['yfest',4,'stage'],['mtpe',3,'']]) {
  for(let i=1;i<=count;i++) assert.ok(fs.existsSync(`public/images/${folder}/${prefix}${i}.jpg`));
}
new vm.Script(fs.readFileSync('public/assets/js/project-frame.js','utf8'));
console.log('All cover and chapter images exist. Shared script syntax OK.');
