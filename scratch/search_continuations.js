const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('playlist_data.json', 'utf8'));
  
  function searchContinuations(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.continuationItemRenderer) {
      console.log(`Found continuationItemRenderer at ${path}:`, JSON.stringify(obj.continuationItemRenderer));
    }
    
    for (const key of Object.keys(obj)) {
      searchContinuations(obj[key], path + '.' + key);
    }
  }
  
  searchContinuations(data);
} catch (e) {
  console.error(e);
}
