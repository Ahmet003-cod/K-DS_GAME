const fs = require('fs');
const path = require('path');

const shortHtmlPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\short.html';
const html = fs.readFileSync(shortHtmlPath, 'utf8');

// Find title, thumbnail, description
const titleMatch = html.match(/<title>([^<]+)<\/title>/);
const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Bu Eğlenceliydi! 😄🎉';

const descMatch = html.match(/"description":\s*"([^"]+)"/) || html.match(/meta name="description" content="([^"]+)"/);
const desc = descMatch ? descMatch[1] : 'Maşa ve Koca Ayı sevimli short videosu!';

console.log(`Video ID: -N6ir0hXS-M`);
console.log(`Title: ${title}`);
console.log(`Description: ${desc}`);
