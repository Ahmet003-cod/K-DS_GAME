const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web';
const finalVideosPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\final_65_videos.json';
const allVideos = JSON.parse(fs.readFileSync(finalVideosPath, 'utf8'));

// Recreate original server.js structure
const originalServerHead = `/**
 * ÇOCUK DÜNYASI - BACKEND AGENT v4.0 (SQLite Destekli)
 * =====================================================
 * 🗄️ SQLite veritabanı — internet olmadan çalışır
 * 🤖 YouTube RSS agent — her 5 dk yeni video çeker
 * 📡 /api/videos, /api/shorts, /api/search, /api/status
 */

const http         = require('http');
const https        = require('https');
const fs           = require('fs');
const path         = require('path');
const Database     = require('better-sqlite3');

const PORT    = 8080;
const DB_FILE = path.join(__dirname, 'videos.db');

// ─────────────────────────────────────────────────────────
// KÜRATÖRLÜ VİDEO LİSTESİ (Test edilmiş — tümü çalışır)
// ─────────────────────────────────────────────────────────
// UZAKTAN İNDİRİLECEK ORİJİNAL MP4 LİNKLERİ (CORS & İnternetsiz çalışma için)
// ─────────────────────────────────────────────────────────
const REMOTE_VIDEO_URLS = {
  "sintel-cartoon": "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "oceans-video": "https://vjs.zencdn.net/v/oceans.mp4",
  "big-buck-bunny": "https://test-videos.co.uk/vids/big_buck_bunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "elephants-dream": "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "sample-nature": "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
  "tears-of-steel": "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "bigger-fun": "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
  "bigger-joyrides": "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "bigger-escapes": "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
  "bigger-blazes": "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4"
};

const PRIMARY_VIDEOS = [
  { id: "sintel-cartoon", url: "/local_videos/sintel-cartoon.mp4", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&auto=format&fit=crop" },
  { id: "oceans-video", url: "/local_videos/oceans-video.mp4", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },
  { id: "big-buck-bunny", url: "/local_videos/big-buck-bunny.mp4", thumbnail: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop" },
  { id: "elephants-dream", url: "/local_videos/elephants-dream.mp4", thumbnail: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop" },
  { id: "sample-nature", url: "/local_videos/sample-nature.mp4", thumbnail: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop" },
  { id: "tears-of-steel", url: "/local_videos/tears-of-steel.mp4", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop" },
  { id: "bigger-fun", url: "/local_videos/bigger-fun.mp4", thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop" },
  { id: "bigger-joyrides", url: "/local_videos/bigger-joyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop" },
  { id: "bigger-escapes", url: "/local_videos/bigger-escapes.mp4", thumbnail: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&auto=format&fit=crop" },
  { id: "bigger-blazes", url: "/local_videos/bigger-blazes.mp4", thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop" }
];

const CUTE_SUBJECTS = [
  { emoji: "🐱", name: "Kedi Bobo", category: "cartoons" },
  { emoji: "🐢", name: "Niloya", category: "cartoons" },
  { emoji: "🐰", name: "Tavşan Bunny", category: "cartoons" },
  { emoji: "🐉", name: "Ejderha Sintel", category: "cartoons" },
  { emoji: "🌲", name: "Orman Dostları", category: "learning" },
  { emoji: "🐟", name: "Kırmızı Balık", category: "songs" },
  { emoji: "🦈", name: "Köpekbalığı Bob", category: "songs" },
  { emoji: "🐴", name: "Eşek Kukuli", category: "songs" },
  { emoji: "🥞", name: "Pepee Dede", category: "songs" },
  { emoji: "🐶", name: "Ajan Çiko", category: "learning" },
  { emoji: "🐥", name: "Şirin Civcivler", category: "cartoons" },
  { emoji: "🦁", name: "Aslan Kral", category: "learning" },
  { emoji: "🦊", name: "Kurnaz Tilki", category: "learning" },
  { emoji: "🐸", name: "Zıpzıp Kurbağa", category: "songs" },
  { emoji: "🌈", name: "Renk Dünyası", category: "learning" }
];

const CUTE_ACTIONS = [
  "Dans Ediyor", "Maceraya Çıkıyor", "Şarkı Söylüyor", "Uykudan Uyanıyor", 
  "Oyun Oynuyor", "Yemek Yiyor", "Arkadaşlarıyla Buluşuyor", "Uçan Balonla Geziyor",
  "Saklambaç Oynuyor", "Yeni Şeyler Öğreniyor", "Kahkahalarla Gülüyor", "Yıldızları İzliyor",
  "Piknik Yapıyor", "Boya Yapıyor", "Koşup Zıplıyor"
];

const CUTE_DESCS = [
  "Sevimli dostumuzun kalbinizi ısıtacak ve yüzünüzü güldürecek en tatlı anları!",
  "Eğitici, neşeli ve tamamen çocuklara özel hazırlanmış harika bir serüven.",
  "İnternet olmasa da dilediğin gibi izleyebileceğin harika ve sevimli bir child videosu!",
  "Çocukların hayal dünyasını geliştirecek, neşeli müziklerle süslenmiş sevimli klip.",
  "Sevimli maskotlarımızın güldüren ve merak uyandıran yepyeni tatlı maceraları!"
];

const CUTE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf", // köpek
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", // kedi
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // deniz
  "https://images.unsplash.com/photo-1515488042361-404e9250afef", // tavşan
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d", // aslan
  "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9", // doğa
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699", // gökyüzü
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74", // mutlu çocuk
  "https://images.unsplash.com/photo-1596495578065-6e0763fa1178", // küpler
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b", // lego
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986", // uzay
  "https://images.unsplash.com/photo-1472491235688-bdc81a63246e", // sevimli kedi
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131", // küçük kedi
  "https://images.unsplash.com/photo-1550064824-8f993041ffd3", // bebek gülüşü
  "https://images.unsplash.com/photo-1484820540004-14229fe36ca4", // balonlar
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55"  // çizim
];
`;

const originalServerTail = `
// ─────────────────────────────────────────────────────────
// 🗄️ SQLite VERİTABANI BAŞLATICI
// ─────────────────────────────────────────────────────────
let db;
function initDatabase() {
  db = new Database(DB_FILE);

  // WAL modu (daha hızlı okuma/yazma)
  db.pragma('journal_mode = WAL');

  // Tablo oluştur
  db.exec(\`
    CREATE TABLE IF NOT EXISTS videos (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      desc       TEXT,
      url        TEXT,
      youtubeId  TEXT,
      thumbnail  TEXT,
      category   TEXT DEFAULT 'cartoons',
      duration   TEXT DEFAULT 'medium',
      badge      TEXT,
      keywords   TEXT,
      source     TEXT DEFAULT 'curated',
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  \`);

  // Mevcut eski YouTube ve RSS kayıtlarını tamamen sil, sadece 65 sabit video kalsın!
  db.exec("DELETE FROM videos");

  // Seed verilerini ekle (varsa güncelle, yoksa ekle)
  const insertVideo = db.prepare(\`
    INSERT OR REPLACE INTO videos
      (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)
    VALUES
      (@id, @title, @desc, @url, @youtubeId, @thumbnail, @category, @duration, @badge, @keywords, @source)
  \`);

  const insertMany = db.transaction((videos) => {
    for (const v of videos) {
      insertVideo.run({
        ...v,
        keywords: (v.keywords || [v.title.toLowerCase()]).join(','),
        source: 'curated',
      });
    }
  });

  insertMany(SEED_VIDEOS);

  const count = db.prepare('SELECT COUNT(*) as n FROM videos').get();
  console.log(\`[🗄️  SQLite] Veritabanı hazır: \${count.n} video (50 Short + 15 Normal)\`);
  return db;
}

// ─────────────────────────────────────────────────────────
// VERİTABANI SORGU YARDIMCILARI
// ─────────────────────────────────────────────────────────
function dbGetVideos({ category, duration, q } = {}) {
  let sql    = 'SELECT * FROM videos WHERE 1=1';
  const args = [];

  if (category && category !== 'all' && category !== 'shorts') {
    sql += ' AND category = ?';
    args.push(category);
  }
  if (category === 'shorts' || duration === 'short') {
    sql += " AND duration = 'short'";
  }
  if (q) {
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(keywords) LIKE ?)';
    const like = \`%\${q.toLowerCase()}%\`;
    args.push(like, like, like);
  }

  sql += ' ORDER BY source DESC, created_at DESC';
  return db.prepare(sql).all(...args).map(dbRowToVideo);
}

function dbSearch(q) {
  const like = \`%\${q.toLowerCase()}%\`;
  return db.prepare(\`
    SELECT * FROM videos
    WHERE LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(keywords) LIKE ?
    ORDER BY source DESC
  \`).all(like, like, like).map(dbRowToVideo);
}

function dbGetStats() {
  return {
    total:   db.prepare("SELECT COUNT(*) as n FROM videos").get().n,
    mp4:     db.prepare("SELECT COUNT(*) as n FROM videos WHERE url IS NOT NULL AND url != ''").get().n,
    youtube: db.prepare("SELECT COUNT(*) as n FROM videos WHERE youtubeId IS NOT NULL AND youtubeId != ''").get().n,
    shorts:  db.prepare("SELECT COUNT(*) as n FROM videos WHERE duration='short'").get().n,
    rss:     db.prepare("SELECT COUNT(*) as n FROM videos WHERE source='rss'").get().n,
  };
}

function dbRowToVideo(row) {
  return {
    id:        row.id,
    title:     row.title,
    desc:      row.desc,
    url:       row.url || undefined,
    youtubeId: row.youtubeId || undefined,
    thumbnail: row.thumbnail,
    category:  row.category,
    duration:  row.duration,
    badge:     row.badge,
    keywords:  row.keywords ? row.keywords.split(',') : [],
  };
}

// Yeni video ekle (RSS'den gelen)
function dbInsertRSSVideo(video) {
  try {
    db.prepare(\`
      INSERT OR IGNORE INTO videos
        (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rss')
    \`).run(
      video.id, video.title, video.desc,
      video.url || null, video.youtubeId || null,
      video.thumbnail, video.category, video.duration,
      video.badge, (video.keywords || []).join(',')
    );
    return true;
  } catch(e) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// 🤖 YOUTUBE RSS AGENT
// ─────────────────────────────────────────────────────────
const KIDS_CHANNELS = [
  { name: "TRT Çocuk", id: "UC2J-uK-mQ7gGZ6_WJ4uOqfA", category: "cartoons" },
  { name: "Kukuli",    id: "UCqCqKMBkpfhYiGLCZJP0lPA",  category: "songs"   },
  { name: "Adisebaba", id: "UC2o7dBpFnm6bHH5qdHHluIg",  category: "songs"   },
];

let lastAgentRun = 0;
const AGENT_TTL  = 5 * 60 * 1000;

function fetchRSS(channelId) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.youtube.com',
      path:     \`/feeds/videos.xml?channel_id=\${channelId}\`,
      method:   'GET',
      timeout:  8000,
      headers:  { 'User-Agent': 'CocukDunyasi/4.0' },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('RSS timeout')); });
    req.end();
  });
}

function parseRSS(xml, channelName, category) {
  const results = [];
  xml.split('<entry>').slice(1).forEach(entry => {
    const idM    = entry.match(/<yt:videoId>([^<]+)<\\/yt:videoId>/);
    const titleM = entry.match(/<title>([^<]+)<\\/title>/);
    const thumbM = entry.match(/<media:thumbnail url="([^"]+)"/);
    const descM  = entry.match(/<media:description>([^<]{0,100})/);
    if (!idM || !titleM) return;
    const vid = idM[1].trim();
    results.push({
      id:        \`rss-\${vid}\`,
      title:     titleM[1].trim(),
      desc:      descM ? descM[1] + '...' : \`\${channelName}'den yeni video!\`,
      youtubeId: vid,
      thumbnail: thumbM ? thumbM[1] : \`https://img.youtube.com/vi/\${vid}/hqdefault.jpg\`,
      category,
      duration:  'medium',
      badge:     \`🤖 Ajan • \${channelName}\`,
      keywords:  [titleM[1].toLowerCase(), channelName.toLowerCase()],
    });
  });
  return results.slice(0, 5);
}

async function runAgentRefresh() {
  // YouTube RSS Agent devre dışı bırakıldı (sadece sabit yerel videolar kullanılacak)
  return;
}

// ─────────────────────────────────────────────────────────
// DOSYA İNDİRME VE PROXY YARDIMCILARI (CORS ve Çevrimdışı Çalışma)
// ─────────────────────────────────────────────────────────
function proxyRemoteVideo(videoUrl, req, res) {
  console.log(\`[Server Proxy] İndirilmeyen video için proxy başlatılıyor: \${videoUrl}\`);
  const clientModule = videoUrl.startsWith('https') ? https : http;
  
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
  if (req.headers.range) {
    headers['Range'] = req.headers.range;
  }

  const proxyReq = clientModule.get(videoUrl, { headers }, (proxyRes) => {
    // CORS izinlerini ver ve başlıkları aktar
    const resHeaders = { ...proxyRes.headers };
    resHeaders['Access-Control-Allow-Origin'] = '*';
    resHeaders['Access-Control-Allow-Headers'] = '*';
    resHeaders['Access-Control-Expose-Headers'] = '*';
    
    res.writeHead(proxyRes.statusCode, resHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(\`[Server Proxy] Proxy hatası (\${videoUrl}):\`, err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Proxy Hatası: ' + err.message);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath + '.tmp');
    let request;

    const get = (requestUrl, depth = 0) => {
      if (depth > 5) {
        file.close();
        fs.unlink(destPath + '.tmp', () => {});
        reject(new Error('Çok fazla yönlendirme (Redirect Loop)'));
        return;
      }

      const clientModule = requestUrl.startsWith('https') ? https : http;
      request = clientModule.get(requestUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          const redirectUrl = res.headers.location;
          res.resume();
          get(redirectUrl, depth + 1);
          return;
        }

        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath + '.tmp', () => {});
          reject(new Error(\`Sunucu durum kodu: \${res.statusCode}\`));
          return;
        }

        res.pipe(file);

        file.on('finish', () => {
          file.close(() => {
            fs.rename(destPath + '.tmp', destPath, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });
      });

      request.on('error', (err) => {
        file.close();
        fs.unlink(destPath + '.tmp', () => {});
        reject(err);
      });

      request.setTimeout(45000, () => {
        request.destroy();
        file.close();
        fs.unlink(destPath + '.tmp', () => {});
        reject(new Error('Zaman aşımı (Timeout - 45s)'));
      });
    };

    get(url);
  });
}

async function downloadLocalVideos() {
  const dir = path.join(__dirname, 'local_videos');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('[Disk Downloader] Yerel MP4 videoları kontrol ediliyor...');
  
  for (const [id, url] of Object.entries(REMOTE_VIDEO_URLS)) {
    const dest = path.join(dir, \`\${id}.mp4\`);
    
    if (fs.existsSync(dest)) {
      try {
        const stats = fs.statSync(dest);
        if (stats.size > 100 * 1024) { // En az 100KB ise geçerli sayalım
          console.log(\`[Disk Downloader] \${id}.mp4 zaten diskte hazır.\`);
          continue;
        }
      } catch(e) {}
    }
    
    console.log(\`[Disk Downloader] 📥 \${id} arka planda indirilmeye başlandı...\`);
    downloadFile(url, dest)
      .then(() => {
        console.log(\`[Disk Downloader] 🏆 \${id}.mp4 başarıyla diskte depolandı! (CORS'suz ve internetsiz oynatıma hazır)\`);
      })
      .catch((err) => {
        console.error(\`[Disk Downloader] ❌ \${id}.mp4 indirilemedi:\`, err.message);
      });
  }
}

// ─────────────────────────────────────────────────────────
// HTTP SUNUCUSU
// ─────────────────────────────────────────────────────────
function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type':  'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

const server = require('http').createServer(async (req, res) => {
  const parsed   = new URL(req.url, \`http://localhost:\${PORT}\`);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  console.log(\`[Server] \${req.method} \${pathname}\`);

  // ── YEREL MP4 VİDEOLAR İÇİN CORS/FALLBACK VE PROXY ─────
  if (pathname.startsWith('/local_videos/')) {
    const filename = path.basename(pathname);
    const id = filename.replace('.mp4', '');
    const localPath = path.join(__dirname, 'local_videos', filename);

    if (!fs.existsSync(localPath)) {
      const remoteUrl = REMOTE_VIDEO_URLS[id];
      if (remoteUrl) {
        proxyRemoteVideo(remoteUrl, req, res);
        return;
      }
    }
  }

  // ── API ROUTE'LARI ─────────────────────────────────────
  if (pathname === '/api/videos') {
    runAgentRefresh().catch(() => {});
    const list = dbGetVideos({
      category: parsed.searchParams.get('category') || 'all',
      duration: parsed.searchParams.get('duration') || 'all',
      q:        parsed.searchParams.get('q') || '',
    });
    return sendJSON(res, list);
  }

  if (pathname === '/api/shorts') {
    runAgentRefresh().catch(() => {});
    return sendJSON(res, dbGetVideos({ duration: 'short' }));
  }

  if (pathname === '/api/search') {
    const q = parsed.searchParams.get('q') || '';
    if (!q) return sendJSON(res, { error: 'q parametresi gerekli' }, 400);
    const results = dbSearch(q);
    return sendJSON(res, results.length > 0 ? results : dbGetVideos().slice(0, 4));
  }

  if (pathname === '/api/status') {
    const stats = dbGetStats();
    return sendJSON(res, {
      status:      'running',
      version:     '4.0',
      database:    'SQLite (videos.db)',
      lastRefresh: new Date(lastAgentRun || Date.now()).toISOString(),
      ...stats,
    });
  }

  // ── STATİK DOSYALAR ────────────────────────────────────
  let filePath = pathname === '/' ? './index.html' : '.' + pathname;
  filePath = path.resolve(__dirname, filePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.css':  'text/css; charset=utf-8',
      '.js':   'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg':  'image/svg+xml',
      '.png':  'image/png',
      '.jpg':  'image/jpeg',
      '.mp4':  'video/mp4',
      '.webmanifest': 'application/manifest+json',
    };
    const contentType = mime[ext] || 'application/octet-stream';

    // HTTP 206 Range desteği (MP4 streaming için kritik)
    const range = req.headers.range;
    if (range && ext === '.mp4') {
      const [s, e]   = range.replace(/bytes=/, '').split('-');
      const start    = parseInt(s, 10);
      const end      = e ? parseInt(e, 10) : stats.size - 1;
      const chunkLen = end - start + 1;
      res.writeHead(206, {
        'Content-Range':  \`bytes \${start}-\${end}/\${stats.size}\`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunkLen,
        'Content-Type':   contentType,
        'Cache-Control':  'public, max-age=86400',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type':   contentType,
        'Content-Length': stats.size,
        'Cache-Control':  'public, max-age=3600',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

// ─────────────────────────────────────────────────────────
// BAŞLAT
// ─────────────────────────────────────────────────────────
initDatabase();
runAgentRefresh().catch(() => {});
downloadLocalVideos().catch(() => {});

server.listen(PORT, '0.0.0.0', () => {
  const stats = dbGetStats();
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  🤖 ÇOCUK DÜNYASI BACKEND AGENT v4.0 (SQLite)       ║');
  console.log(\`║  🌐  http://localhost:\${PORT}                            ║\`);
  console.log(\`║  🗄️   SQLite DB: \${stats.total} video (\${stats.mp4} MP4 + \${stats.youtube} YouTube) ║\`);
  console.log(\`║  ⚡  Short videolar: \${stats.shorts}                             ║\`);
  console.log('║  📡  /api/videos   /api/shorts   /api/search        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
});

// Her 5 dakika RSS yenile
setInterval(() => {
  lastAgentRun = 0;
  runAgentRefresh().catch(console.error);
}, AGENT_TTL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n[Server] Kapatılıyor...');
  db.close();
  process.exit(0);
});
`;

// Recreate original videos.js structure
const originalVideosHead = `/**
 * ÇOCUK DÜNYASI - VİDEO MODÜLÜ v4.0
 * ================================================
 * DÜZELTMELER:
 *  - Eski localStorage cache'leri temizlenir
 *  - VIDEO_DATABASE global ve doğru güncellenir
 *  - Short video kategorisi tam çalışır
 *  - Tüm 5 MP4 video açılır
 *  - YouTube IFrame API ile embed oynatma
 *  - YouTube hatası → "YouTube'da Aç" butonu
 * ================================================
 */

// ─────────────────────────────────────────────────────────
// ESKİ CACHE TEMİZLEME (localStorage v1/v2/v3 temizle)
// ─────────────────────────────────────────────────────────
(function clearOldCaches() {
  ['cached_agent_videos', 'cached_agent_videos_v2', 'agent_videos_v2', 'agent_videos_v3'].forEach(k => {
    localStorage.removeItem(k);
  });
})();

// ─────────────────────────────────────────────────────────
// YEREL FALLBACK VERİTABANI (sunucu kapalıyken de çalışır)
// ─────────────────────────────────────────────────────────
const PRIMARY_VIDEOS = [
  { id: "sintel-cartoon", url: "/local_videos/sintel-cartoon.mp4", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&auto=format&fit=crop" },
  { id: "oceans-video", url: "/local_videos/oceans-video.mp4", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },
  { id: "big-buck-bunny", url: "/local_videos/big-buck-bunny.mp4", thumbnail: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop" },
  { id: "elephants-dream", url: "/local_videos/elephants-dream.mp4", thumbnail: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop" },
  { id: "sample-nature", url: "/local_videos/sample-nature.mp4", thumbnail: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop" },
  { id: "tears-of-steel", url: "/local_videos/tears-of-steel.mp4", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop" },
  { id: "bigger-fun", url: "/local_videos/bigger-fun.mp4", thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop" },
  { id: "bigger-joyrides", url: "/local_videos/bigger-joyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop" },
  { id: "bigger-escapes", url: "/local_videos/bigger-escapes.mp4", thumbnail: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&auto=format&fit=crop" },
  { id: "bigger-blazes", url: "/local_videos/bigger-blazes.mp4", thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop" }
];

const CUTE_SUBJECTS = [
  { emoji: "🐱", name: "Kedi Bobo", category: "cartoons" },
  { emoji: "🐢", name: "Niloya", category: "cartoons" },
  { emoji: "🐰", name: "Tavşan Bunny", category: "cartoons" },
  { emoji: "🐉", name: "Ejderha Sintel", category: "cartoons" },
  { emoji: "🌲", name: "Orman Dostları", category: "learning" },
  { emoji: "🐟", name: "Kırmızı Balık", category: "songs" },
  { emoji: "🦈", name: "Köpekbalığı Bob", category: "songs" },
  { emoji: "🐴", name: "Eşek Kukuli", category: "songs" },
  { emoji: "🥞", name: "Pepee Dede", category: "songs" },
  { emoji: "🐶", name: "Ajan Çiko", category: "learning" },
  { emoji: "🐥", name: "Şirin Civcivler", category: "cartoons" },
  { emoji: "🦁", name: "Aslan Kral", category: "learning" },
  { emoji: "🦊", name: "Kurnaz Tilki", category: "learning" },
  { emoji: "🐸", name: "Zıpzıp Kurbağa", category: "songs" },
  { emoji: "🌈", name: "Renk Dünyası", category: "learning" }
];

const CUTE_ACTIONS = [
  "Dans Ediyor", "Maceraya Çıkıyor", "Şarkı Söylüyor", "Uykudan Uyanıyor", 
  "Oyun Oynuyor", "Yemek Yiyor", "Arkadaşlarıyla Buluşuyor", "Uçan Balonla Geziyor",
  "Saklambaç Oynuyor", "Yeni Şeyler Öğreniyor", "Kahkahalarla Gülüyor", "Yıldızları İzliyor",
  "Piknik Yapıyor", "Boya Yapıyor", "Koşup Zıplıyor"
];

const CUTE_DESCS = [
  "Sevimli dostumuzun kalbinizi ısıtacak ve yüzünüzü güldürecek en tatlı anları!",
  "Eğitici, neşeli ve tamamen çocuklara özel hazırlanmış harika bir serüven.",
  "İnternet olmasa da dilediğin gibi izleyebileceğin harika ve sevimli bir çocuk videosu!",
  "Çocukların hayal dünyasını geliştirecek, neşeli müziklerle süslenmiş sevimli klip.",
  "Sevimli maskotlarımızın güldüren ve merak uyandıran yepyeni tatlı maceraları!"
];

const CUTE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf", // köpek
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", // kedi
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // deniz
  "https://images.unsplash.com/photo-1515488042361-404e9250afef", // tavşan
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d", // aslan
  "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9", // doğa
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699", // gökyüzü
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74", // mutlu çocuk
  "https://images.unsplash.com/photo-1596495578065-6e0763fa1178", // küpler
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b", // lego
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986", // uzay
  "https://images.unsplash.com/photo-1472491235688-bdc81a63246e", // sevimli kedi
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131", // küçük kedi
  "https://images.unsplash.com/photo-1550064824-8f993041ffd3", // bebek gülüşü
  "https://images.unsplash.com/photo-1484820540004-14229fe36ca4", // balonlar
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55"  // çizim
];
`;

const originalVideosTail = `
// ─────────────────────────────────────────────────────────
// GLOBAL DURUM (Değişkenler)
// ─────────────────────────────────────────────────────────
const VIDEO_CACHE_NAME = 'cocuk-dunyasi-videos-v4';
let VIDEO_DATABASE     = [];      // Aktif video listesi
let currentCategory    = 'all';
let currentFilteredList = [];
let ytPlayer           = null;
let ytAPIReady         = false;

// ─────────────────────────────────────────────────────────
// YouTube IFrame API
// ─────────────────────────────────────────────────────────
function loadYouTubeAPI() {
  if (document.getElementById('yt-api-script')) return;
  const s  = document.createElement('script');
  s.id     = 'yt-api-script';
  s.src    = 'https://www.youtube.com/iframe_api';
  s.onerror = () => console.warn('[YT API] Yüklenemedi (internet yok?)');
  document.head.appendChild(s);
}

window.onYouTubeIframeAPIReady = () => {
  ytAPIReady = true;
  console.log('[Video] YouTube IFrame API hazır!');
};

// ─────────────────────────────────────────────────────────
// MODÜL BAŞLATICI
// ─────────────────────────────────────────────────────────
function initVideosModule() {
  console.log('[Video] Modül v4.0 başlatılıyor...');
  loadYouTubeAPI();
  loadVideosFromServer();

  // Kategori sekmeleri
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.category;
      currentFilteredList = [...VIDEO_DATABASE];
      applyAndRender();
    });
  });

  // Ajan Çiko arama
  const searchBtn   = document.getElementById('btn-agent-search');
  const searchInput = document.getElementById('agent-search-input');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => runChikoSearch(searchInput.value));
    searchInput.addEventListener('keyup', e => {
      if (e.key === 'Enter') runChikoSearch(searchInput.value);
    });
  }

  // Player kapat
  const closeBtn = document.getElementById('btn-close-player');
  if (closeBtn) closeBtn.addEventListener('click', closeVideoPlayer);

  updateDownloadStatuses();
}

// ─────────────────────────────────────────────────────────
// SUNUCUDAN VİDEO YÜKLEYİCİ
// ─────────────────────────────────────────────────────────
async function loadVideosFromServer() {
  // Önce local fallback ile hemen ekrana bas (0 gecikme)
  VIDEO_DATABASE      = [...LOCAL_VIDEOS];
  currentFilteredList = [...VIDEO_DATABASE];
  applyAndRender();

  // Sonra SQLite backend'den taze listeyi çek
  if (navigator.onLine) {
    try {
      const res   = await fetch('/api/videos', { signal: AbortSignal.timeout(8000) });
      const fresh = await res.json();
      if (Array.isArray(fresh) && fresh.length > 0) {
        VIDEO_DATABASE      = fresh;
        currentFilteredList = [...VIDEO_DATABASE];
        applyAndRender();
        console.log(\`[Video] Backend'den \${fresh.length} video yüklendi.\`);
      }
    } catch(e) {
      console.warn('[Video] Backend yüklemesi başarısız, yerel liste kullanılıyor:', e.message);
    }
  }

  updateDownloadStatuses();
}

// ─────────────────────────────────────────────────────────
// AJAN ÇİKO ARAMA
// ─────────────────────────────────────────────────────────
async function runChikoSearch(rawQuery) {
  const loaderEl = document.getElementById('agent-loading');
  const q        = rawQuery.trim().toLowerCase();

  if (loaderEl) loaderEl.style.display = 'flex';
  if (typeof playPopSound === 'function') { playPopSound(); setTimeout(() => playPopSound(), 150); }

  await new Promise(r => setTimeout(r, 800)); // Minimum 0.8s animasyon

  if (!q || q === 'hepsi' || q === 'tümü') {
    currentFilteredList = [...VIDEO_DATABASE];
  } else {
    // Önce API'den ara (SQLite full-text)
    let results = null;
    if (navigator.onLine) {
      try {
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: AbortSignal.timeout(5000) });
        results   = await res.json();
      } catch(e) { /* offline fallback */ }
    }

    if (Array.isArray(results) && results.length > 0) {
      currentFilteredList = results;
    } else {
      // Yerel fuzzy arama
      currentFilteredList = VIDEO_DATABASE.filter(v => {
        const s = [v.title, v.desc, ...(v.keywords || [])].join(' ').toLowerCase();
        return s.includes(q);
      });
      if (currentFilteredList.length === 0) {
        currentFilteredList = VIDEO_DATABASE.slice(0, 4);
        alert(\`🐶 Hav! Ajan Çiko "\${rawQuery.trim()}" için bulamadı ama en eğlenceli videolar getirildi!\`);
      }
    }
  }

  if (loaderEl) loaderEl.style.display = 'none';
  if (typeof playPopSound === 'function') { playPopSound(); setTimeout(() => playPopSound(), 100); setTimeout(() => playPopSound(), 200); }
  applyAndRender();
}

// ─────────────────────────────────────────────────────────
// FİLTRE + RENDER UYGULA
// ─────────────────────────────────────────────────────────
function applyAndRender() {
  const favs = getFavorites();
  let list   = [...currentFilteredList];

  if (currentCategory === 'favorites') {
    list = list.filter(v => favs.includes(v.id));
  } else if (currentCategory === 'shorts') {
    list = list.filter(v => v.duration === 'short');
  } else if (currentCategory !== 'all') {
    list = list.filter(v => v.category === currentCategory);
  }

  renderVideosList(list);
}

// ─────────────────────────────────────────────────────────
// VIDEO KARTELERİ RENDER ET
// ─────────────────────────────────────────────────────────
async function renderVideosList(list) {
  const catalog = document.getElementById('video-catalog');
  if (!catalog) return;
  catalog.innerHTML = '';

  const isOnline      = navigator.onLine;
  const favs          = getFavorites();
  const downloadedIds = await getDownloadedIds();

  if (!list || list.length === 0) {
    catalog.innerHTML = \`
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:rgba(255,255,255,0.75);border-radius:20px;">
        <div style="font-size:52px">🔍</div>
        <h3 style="margin:12px 0 6px;color:var(--text-dark)">Video Bulunamadı</h3>
        <p style="color:var(--text-light)">Ajan Çiko'ya farklı şeyler aratabilir ya da kategorileri değiştirebilirsin.</p>
      </div>\`;
    return;
  }

  list.forEach(video => {
    const isYT         = !!(video.youtubeId);
    const isMP4        = !!(video.url);
    const isDownloaded = isMP4 && downloadedIds.includes(video.url);
    const isFav        = favs.includes(video.id);
    const isShort      = video.duration === 'short';
    const isDisabled   = !isOnline && isYT;

    const card = document.createElement('div');
    // NOT: short-card sınıfını veriyoruz ama ::before z-index sorununu CSS'de çözdük
    card.className = \`video-card\${isShort ? ' short-card' : ''}\${isDisabled ? ' offline-disabled' : ''}\`;
    card.id        = \`video-card-\${video.id}\`;

    // Çevrimdışı katmanı
    const offlineOverlay = isDisabled ? \`
      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.88);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:inherit;gap:6px;">
        <span style="font-size:32px">😴</span>
        <span style="font-weight:700;font-size:12px;color:#374151">İnternet Gerekli</span>
      </div>\` : '';

    // Short rozet (sol üst)
    const shortTag = isShort
      ? \`<span style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:3px 9px;border-radius:20px;z-index:15;box-shadow:0 2px 8px rgba(255,107,107,0.5);letter-spacing:0.5px;">⚡ SHORT</span>\`
      : '';

    // Kategori rozet (sağ üst)
    const catTag = \`<span class="video-badge" style="\${isYT ? 'background:rgba(220,38,38,0.88)' : 'background:rgba(21,128,61,0.9)'}">\${video.badge || ''}</span>\`;

    // İndirme / YT butonu (sağ alt thumbnail)
    const dlTag = isYT
      ? \`<span style="position:absolute;bottom:8px;right:8px;background:rgba(220,38,38,0.88);color:#fff;font-size:9px;font-weight:800;padding:3px 8px;border-radius:10px;z-index:15;">▶ YT</span>\`
      : \`<button id="dl-btn-\${video.id}" title="\${isDownloaded ? 'Cihazda Kayıtlı' : 'Çevrimdışı İndir'}"
           style="position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
           \${isDownloaded ? '📥' : '💾'}
         </button>\`;

    // Favori butonu (sol alt thumbnail)
    const favTag = \`
      <button class="fav-btn" style="position:absolute;bottom:8px;left:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        \${isFav ? '⭐' : '☆'}
      </button>\`;

    card.innerHTML = \`
      \${offlineOverlay}
      <div class="video-thumbnail-container" style="position:relative;cursor:\${isDisabled ? 'not-allowed' : 'pointer'};">
        \${shortTag}
        \${catTag}
        <img class="video-thumbnail" src="\${video.thumbnail}" alt="\${video.title}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop'">
        <div class="play-overlay" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-size:30px;line-height:1">▶</span>
          <span style="font-size:10px;background:rgba(0,0,0,0.6);padding:2px 10px;border-radius:12px;color:#fff;">
            \${isMP4 ? '🎬 Hemen Oynat' : '▶ YouTube\\\'da İzle'}
          </span>
        </div>
        \${favTag}
        \${dlTag}
      </div>
      <div class="video-info">
        <h3 class="video-title">\${video.title}</h3>
        <p class="video-desc">\${video.desc}</p>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <span class="video-category">
            \${video.category === 'cartoons' ? '🐱 Çizgi Film' : video.category === 'songs' ? '🎵 Şarkı' : '🧠 Eğitici'}
          </span>
          \${isShort ? '<span style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:12px;letter-spacing:0.3px;">⚡ SHORT</span>' : ''}
          \${isMP4 ? '<span style="background:rgba(21,128,61,0.1);color:#15803d;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;border:1px solid rgba(21,128,61,0.2);">✅ MP4</span>' : ''}
        </div>
      </div>\`;

    // Thumbnail tıklama (oynat)
    const thumb = card.querySelector('.video-thumbnail-container');
    if (!isDisabled) {
      thumb.addEventListener('click', () => playVideo(video.id));
    }

    // Favori butonu
    card.querySelector('.fav-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(video.id);
    });

    // İndirme butonu
    card.querySelector(\`#dl-btn-\${video.id}\`)?.addEventListener('click', e => {
      e.stopPropagation();
      toggleDownload(video.id);
    });

    catalog.appendChild(card);
  });

  updateDownloadStatuses();
}

// ─────────────────────────────────────────────────────────
// VİDEO OYNAT
// ─────────────────────────────────────────────────────────
function playVideo(videoId) {
  // VIDEO_DATABASE'de bul
  const video = VIDEO_DATABASE.find(v => v.id === videoId);
  if (!video) {
    console.error('[Video] ID bulunamadı:', videoId, '— DATABASE boyutu:', VIDEO_DATABASE.length);
    return;
  }

  const modal    = document.getElementById('player-modal');
  const mediaCon = document.getElementById('kids-media-container');
  const titleEl  = document.getElementById('player-title');
  if (!modal || !mediaCon) return;

  titleEl.textContent = \`🎬 \${video.title}\`;
  
  if (video.youtubeId) {
    mediaCon.innerHTML = \`
      <div style="position:relative;width:100%;height:100%;background:#000;">
        <iframe id="kids-youtube-iframe"
          src="https://www.youtube.com/embed/\${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="width:100%;height:100%;display:block;border:none;">
        </iframe>
      </div>
      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="color:#6B7280;font-size:11px;">❤️ Güvenli Çocuk YouTube Modu</span>
        <a href="https://www.youtube.com/watch?v=\${video.youtubeId}" target="_blank"
           style="padding:5px 14px;background:#DC2626;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">
          ▶ YouTube'da Aç ↗
        </a>
      </div>\`;
  } else {
    mediaCon.innerHTML  = \`
      <video id="kids-video-player"
        controls autoplay playsinline
        style="width:100%;max-height:65vh;background:#000;display:block;border-radius:0;">
        <source src="\${video.url}" type="video/mp4">
        <p style="color:#fff;padding:20px;text-align:center;">
          Video oynatılamadı. 
          <a href="\${video.url}" target="_blank" style="color:#FCD34D;">Doğrudan aç ↗</a>
        </p>
      </video>
      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="color:#6B7280;font-size:11px;">✅ Doğrudan MP4 oynatılıyor — Çevrimdışı indirilebilir</span>
        <a href="\${video.url}" target="_blank" download
           style="padding:5px 14px;background:#059669;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">
          📥 İndir
        </a>
      </div>\`;
  }

  const vEl = mediaCon.querySelector('#kids-video-player');
  vEl?.addEventListener('error', () => {
    mediaCon.innerHTML = \`
      <div style="background:#111827;padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;">
        <span style="font-size:44px">😔</span>
        <p style="color:#9CA3AF">Video yüklenemedi.</p>
        <a href="\${video.url}" target="_blank"
           style="padding:12px 28px;background:#059669;color:#fff;border-radius:50px;font-weight:700;text-decoration:none;">
          🔗 Doğrudan Aç
        </a>
      </div>\`;
  });

  modal.classList.add('active');
}

// ─────────────────────────────────────────────────────────
// PLAYER KAPAT
// ─────────────────────────────────────────────────────────
function closeVideoPlayer() {
  if (ytPlayer) { try { ytPlayer.destroy(); } catch(e) {} ytPlayer = null; }
  const mc = document.getElementById('kids-media-container');
  if (mc) mc.innerHTML = '';
  document.getElementById('player-modal')?.classList.remove('active');
}

// ─────────────────────────────────────────────────────────
// ÇEVRIMDIŞI İNDİRME
// ─────────────────────────────────────────────────────────
async function toggleDownload(videoId) {
  const video = VIDEO_DATABASE.find(v => v.id === videoId);
  if (!video?.url) return;

  const btn  = document.getElementById(\`dl-btn-\${video.id}\`);
  const dIds = await getDownloadedIds();
  const isDl = dIds.includes(video.url);

  if (isDl) {
    if (!confirm(\`"\${video.title}" çevrimdışı hafızadan silinsin mi?\`)) return;
    const cache = await caches.open(VIDEO_CACHE_NAME);
    await cache.delete(video.url);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'VIDEO_CACHE_UPDATED',
        action: 'delete',
        url: new URL(video.url, window.location.origin).href
      });
    }
    if (btn) { btn.innerHTML = '💾'; btn.title = 'Çevrimdışı İndir'; }
    applyAndRender();
  } else {
    if (!navigator.onLine) { alert('⚠️ İndirmek için internet gerekli.'); return; }
    if (btn) btn.innerHTML = '⌛';
    try {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const r     = await fetch(video.url);
      if (r.ok) {
        await cache.put(video.url, r);
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'VIDEO_CACHE_UPDATED',
            action: 'add',
            url: new URL(video.url, window.location.origin).href
          });
        }
        if (btn) { btn.innerHTML = '📥'; btn.title = 'Cihazda Kayıtlı'; }
        applyAndRender();
      } else throw new Error('HTTP ' + r.status);
    } catch(e) {
      alert('⚠️ İndirme başarısız. İnternet bağlantısını kontrol et.');
      if (btn) btn.innerHTML = '💾';
    }
  }
  if (typeof updateCacheUsageStats === 'function') updateCacheUsageStats();
}

// ─────────────────────────────────────────────────────────
// YARDIMCILAR
// ─────────────────────────────────────────────────────────
async function updateDownloadStatuses() {
  const ids = await getDownloadedIds();
  VIDEO_DATABASE.filter(v => v.url).forEach(v => {
    const btn = document.getElementById(\`dl-btn-\${v.id}\`);
    if (!btn) return;
    const dl = ids.includes(v.url);
    btn.innerHTML = dl ? '📥' : '💾';
    btn.title     = dl ? 'Cihazda Kayıtlı' : 'Çevrimdışı İndir';
  });
}

async function getDownloadedIds() {
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    return (await cache.keys()).map(r => r.url);
  } catch { return []; }
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('kids_video_favorites') || '[]'); }
  catch { return []; }
}

function toggleFavorite(videoId) {
  let favs = getFavorites();
  favs = favs.includes(videoId) ? favs.filter(id => id !== videoId) : [...favs, videoId];
  localStorage.setItem('kids_video_favorites', JSON.stringify(favs));
  applyAndRender();
}

// app.js uyumluluk
function renderVideos(category) {
  currentCategory     = category || 'all';
  currentFilteredList = [...VIDEO_DATABASE];
  applyAndRender();
}
`;

// Re-compile server.js
const serverOutput = originalServerHead + '\n' + serverArrayStr + '\n' + originalServerTail;
fs.writeFileSync(serverJsPath, serverOutput, 'utf8');
console.log('Restored and precisely patched server.js!');

// Re-compile videos.js
const videosOutput = originalVideosHead + '\n' + clientArrayStr + '\n' + originalVideosTail;
fs.writeFileSync(videosJsPath, videosOutput, 'utf8');
console.log('Restored and precisely patched videos.js!');
