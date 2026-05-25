const https = require('https');
const fs = require('fs');

const channels = [
  { name: "TRT Çocuk", id: "UC2J-uK-mQ7gGZ6_WJ4uOqfA", category: "cartoons" },
  { name: "Kukuli",    id: "UCqCqKMBkpfhYiGLCZJP0lPA",  category: "songs"   },
  { name: "Adisebaba", id: "UC2o7dBpFnm6bHH5qdHHluIg",  category: "songs"   },
];

function fetchRSS(channelId) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: {
        'User-Agent': 'CocukDunyasi/4.0'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRSS(xml, channelName, category) {
  const results = [];
  const entries = xml.split('<entry>').slice(1);
  for (const entry of entries) {
    const idM = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleM = entry.match(/<title>([^<]+)<\/title>/);
    const thumbM = entry.match(/<media:thumbnail url="([^"]+)"/);
    const descM = entry.match(/<media:description>([^<]{0,150})/);
    
    if (!idM || !titleM) continue;
    
    const vid = idM[1].trim();
    results.push({
      id: `rss-${vid}`,
      videoId: vid,
      title: titleM[1].trim(),
      desc: descM ? descM[1].trim() + '...' : `${channelName}'den yeni video!`,
      thumbnail: thumbM ? thumbM[1] : `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      category: category,
      duration: 'medium',
      badge: `📺 ${channelName}`
    });
  }
  return results;
}

async function main() {
  const allChannelVideos = [];
  for (const channel of channels) {
    console.log(`Fetching feed for ${channel.name}...`);
    try {
      const xml = await fetchRSS(channel.id);
      const videos = parseRSS(xml, channel.name, channel.category);
      console.log(`Extracted ${videos.length} videos from ${channel.name}`);
      allChannelVideos.push(...videos);
    } catch (e) {
      console.error(`Error fetching feed for ${channel.name}:`, e.message);
    }
  }
  
  fs.writeFileSync('channel_videos.json', JSON.stringify(allChannelVideos, null, 2));
  console.log(`Saved ${allChannelVideos.length} total channel videos!`);
}

main();
