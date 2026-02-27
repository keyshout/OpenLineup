import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import path from 'path';

const html = fs.readFileSync('dist/index.html', 'utf8');
const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => { console.error("PAGE ERROR INCIDENT:", err); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM ENGINE ERR:", err); });

const dom = new JSDOM(html, {
    url: "http://localhost:4173/",
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});
