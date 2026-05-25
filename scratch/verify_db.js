const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web\\videos.db';
const db = new Database(dbPath);

console.log('--- Videos Database Verification ---');

// 1. Total count
const total = db.prepare('SELECT COUNT(*) as n FROM videos').get().n;
console.log(`Total Videos in DB: ${total}`);

// 2. Youtube vs Local MP4
const ytCount = db.prepare("SELECT COUNT(*) as n FROM videos WHERE youtubeId IS NOT NULL AND youtubeId != ''").get().n;
const mp4Count = db.prepare("SELECT COUNT(*) as n FROM videos WHERE url IS NOT NULL AND url != ''").get().n;
console.log(`YouTube Videos: ${ytCount}`);
console.log(`Local MP4 Videos: ${mp4Count}`);

// 3. Category Breakdown
const categories = db.prepare('SELECT category, COUNT(*) as n FROM videos GROUP BY category').all();
console.log('\nCategory Breakdown:');
categories.forEach(c => {
  console.log(`  - ${c.category}: ${c.n} videos`);
});

// 4. Duration Breakdown
const durations = db.prepare('SELECT duration, COUNT(*) as n FROM videos GROUP BY duration').all();
console.log('\nDuration Breakdown:');
durations.forEach(d => {
  console.log(`  - ${d.duration}: ${d.n} videos`);
});

// 5. First 5 videos
console.log('\nFirst 5 Videos in Database:');
const first5 = db.prepare('SELECT id, title, youtubeId, category, duration, badge FROM videos LIMIT 5').all();
first5.forEach((v, index) => {
  console.log(`${index + 1}. [${v.id}] [${v.duration}] [${v.category}] ${v.title} (YT: ${v.youtubeId}) [${v.badge}]`);
});

db.close();
