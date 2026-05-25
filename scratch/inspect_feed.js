const https = require('https');
const fs = require('fs');

https.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCqCqKMBkpfhYiGLCZJP0lPA', {
  headers: {
    'User-Agent': 'CocukDunyasi/4.0'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Response status: ${res.statusCode}`);
    console.log(`Length: ${data.length}`);
    fs.writeFileSync('feed_sample.xml', data);
    console.log('Saved to feed_sample.xml');
  });
}).on('error', console.error);
