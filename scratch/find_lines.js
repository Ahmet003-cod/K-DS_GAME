const fs = require('fs');

const file = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web\\videos.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('function initVideosModule')) {
    console.log(`initVideosModule found at line ${index + 1}: ${line}`);
  }
  if (line.includes('let currentCategory')) {
    console.log(`currentCategory found at line ${index + 1}: ${line}`);
  }
  if (line.includes('function applyAndRender')) {
    console.log(`applyAndRender found at line ${index + 1}: ${line}`);
  }
});
