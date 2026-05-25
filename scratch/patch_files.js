const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web';
const finalVideosPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\final_65_videos.json';
const allVideos = JSON.parse(fs.readFileSync(finalVideosPath, 'utf8'));

// Generate static arrays
const serverArrayStr = "const SEED_VIDEOS = " + JSON.stringify(allVideos, null, 2) + ";";
const clientArrayStr = "const LOCAL_VIDEOS = " + JSON.stringify(allVideos, null, 2) + ";";

// 1. Patch server.js
const serverJsPath = path.join(projectDir, 'server.js');
let serverContent = fs.readFileSync(serverJsPath, 'utf8');

// Find the loop generation code in server.js
const serverTargetStart = 'const SEED_VIDEOS = [];';
const serverTargetEnd = 'insertMany(SEED_VIDEOS);';

const serverStartIndex = serverContent.indexOf(serverTargetStart);
const serverEndIndex = serverContent.indexOf(serverTargetEnd);

if (serverStartIndex !== -1 && serverEndIndex !== -1) {
  // We want to replace from 'const SEED_VIDEOS = [];' up to the line before 'insertMany(SEED_VIDEOS);'
  const before = serverContent.substring(0, serverStartIndex);
  const after = serverContent.substring(serverEndIndex);
  
  const newServerContent = before + serverArrayStr + '\n\n' + after;
  fs.writeFileSync(serverJsPath, newServerContent, 'utf8');
  console.log('Successfully patched server.js!');
} else {
  console.error('Could not find target indexes in server.js');
}

// 2. Patch videos.js
const videosJsPath = path.join(projectDir, 'videos.js');
let videosContent = fs.readFileSync(videosJsPath, 'utf8');

const videosTargetStart = 'const LOCAL_VIDEOS = [];';
const videosTargetEnd = 'const VIDEO_CACHE_NAME = \'cocuk-dunyasi-videos-v4\';';

const videosStartIndex = videosContent.indexOf(videosTargetStart);
const videosEndIndex = videosContent.indexOf(videosTargetEnd);

if (videosStartIndex !== -1 && videosEndIndex !== -1) {
  const before = videosContent.substring(0, videosStartIndex);
  const after = videosContent.substring(videosEndIndex);
  
  const newVideosContent = before + clientArrayStr + '\n\n' + after;
  fs.writeFileSync(videosJsPath, newVideosContent, 'utf8');
  console.log('Successfully patched videos.js!');
} else {
  console.error('Could not find target indexes in videos.js');
}
