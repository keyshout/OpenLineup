const fs = require('fs');
const js = fs.readFileSync('src/main.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

const jsIds = [...js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const htmlIds = [...html.matchAll(/id=['"]([^'"]+)['"]/g)].map(m => m[1]);

const missing = jsIds.filter(id => !htmlIds.includes(id));
console.log('Missing IDs in HTML:', [...new Set(missing)]);
