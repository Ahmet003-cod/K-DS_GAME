const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('playlist_data.json', 'utf8'));
  
  // Search for video count
  function findCount(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.videoCountText) {
      console.log(`Found videoCountText at ${path}:`, JSON.stringify(obj.videoCountText));
    }
    if (obj.videoCountShortText) {
      console.log(`Found videoCountShortText at ${path}:`, JSON.stringify(obj.videoCountShortText));
    }
    if (obj.videoCount) {
      console.log(`Found videoCount at ${path}:`, obj.videoCount);
    }
    
    for (const key of Object.keys(obj)) {
      findCount(obj[key], path + '.' + key);
    }
  }
  
  findCount(data);
} catch (e) {
  console.error(e);
}
