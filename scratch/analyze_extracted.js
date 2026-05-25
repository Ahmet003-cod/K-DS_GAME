const fs = require('fs');
const path = require('path');

const extractedPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\extracted_videos.json';
const videos = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

console.log(`Total videos found: ${videos.length}`);
console.log('Shorts vs Medium:');
let shortsCount = 0;
let mediumCount = 0;

videos.forEach((v, index) => {
  // Check if duration looks like short (e.g. less than 1 min: "0:55", "0:52", etc.)
  const parts = v.duration.split(':');
  let durationSec = 0;
  if (parts.length === 2) {
    durationSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  } else if (parts.length === 3) {
    durationSec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  }
  
  const isShort = durationSec <= 60;
  if (isShort) shortsCount++;
  else mediumCount++;
  
  console.log(`${index + 1}. [${v.duration}] [${isShort ? 'SHORT' : 'MEDIUM'}] ${v.title} (ID: ${v.videoId})`);
});

console.log(`\nShorts: ${shortsCount}`);
console.log(`Medium: ${mediumCount}`);
