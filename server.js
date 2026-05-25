/**
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

// Gerçek çocuk videolarını video_data.js modülünden yükle
const SEED_VIDEOS = require('./video_data.js');

// ─────────────────────────────────────────────────────────
// 🗄️ SQLite VERİTABANI BAŞLATICI
// ─────────────────────────────────────────────────────────
let db;
function initDatabase() {
  db = new Database(DB_FILE);

  // WAL modu (daha hızlı okuma/yazma)
  db.pragma('journal_mode = WAL');

  // Tablo oluştur
  db.exec(`
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
  `);

  // Mevcut kayıtları temizle, yeni gerçek videoları ekle
  db.exec("DELETE FROM videos");

  // Seed verilerini ekle
  const insertVideo = db.prepare(`
    INSERT OR REPLACE INTO videos
      (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)
    VALUES
      (@id, @title, @desc, @url, @youtubeId, @thumbnail, @category, @duration, @badge, @keywords, @source)
  `);

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
  console.log(`[🗄️  SQLite] Veritabanı hazır: ${count.n} gerçek çocuk videosu yüklendi.`);
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
    const like = `%${q.toLowerCase()}%`;
    args.push(like, like, like);
  }

  sql += ' ORDER BY source DESC, created_at DESC';
  return db.prepare(sql).all(...args).map(dbRowToVideo);
}

function dbSearch(q) {
  const like = `%${q.toLowerCase()}%`;
  return db.prepare(`
    SELECT * FROM videos
    WHERE LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(keywords) LIKE ?
    ORDER BY source DESC
  `).all(like, like, like).map(dbRowToVideo);
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
    db.prepare(`
      INSERT OR IGNORE INTO videos
        (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rss')
    `).run(
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
      path:     `/feeds/videos.xml?channel_id=${channelId}`,
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
    const idM    = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleM = entry.match(/<title>([^<]+)<\/title>/);
    const thumbM = entry.match(/<media:thumbnail url="([^"]+)"/);
    const descM  = entry.match(/<media:description>([^<]{0,100})/);
    if (!idM || !titleM) return;
    const vid = idM[1].trim();
    results.push({
      id:        `rss-${vid}`,
      title:     titleM[1].trim(),
      desc:      descM ? descM[1] + '...' : `${channelName}'den yeni video!`,
      youtubeId: vid,
      thumbnail: thumbM ? thumbM[1] : `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      category,
      duration:  'medium',
      badge:     `🤖 Ajan • ${channelName}`,
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
  console.log(`[Server Proxy] İndirilmeyen video için proxy başlatılıyor: ${videoUrl}`);
  const clientModule = videoUrl.startsWith('https') ? https : http;
  
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
  if (req.headers.range) {
    headers['Range'] = req.headers.range;
  }

  const proxyReq = clientModule.get(videoUrl, { headers }, (proxyRes) => {
    const resHeaders = { ...proxyRes.headers };
    resHeaders['Access-Control-Allow-Origin'] = '*';
    resHeaders['Access-Control-Allow-Headers'] = '*';
    resHeaders['Access-Control-Expose-Headers'] = '*';
    
    res.writeHead(proxyRes.statusCode, resHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Server Proxy] Proxy hatası (${videoUrl}):`, err.message);
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
          reject(new Error(`Sunucu durum kodu: ${res.statusCode}`));
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
    const dest = path.join(dir, `${id}.mp4`);
    
    if (fs.existsSync(dest)) {
      try {
        const stats = fs.statSync(dest);
        if (stats.size > 100 * 1024) {
          console.log(`[Disk Downloader] ${id}.mp4 zaten diskte hazır.`);
          continue;
        }
      } catch(e) {}
    }
    
    console.log(`[Disk Downloader] 📥 ${id} arka planda indirilmeye başlandı...`);
    downloadFile(url, dest)
      .then(() => {
        console.log(`[Disk Downloader] 🏆 ${id}.mp4 başarıyla diskte depolandı!`);
      })
      .catch((err) => {
        console.error(`[Disk Downloader] ❌ ${id}.mp4 indirilemedi:`, err.message);
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
  const parsed   = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  console.log(`[Server] ${req.method} ${pathname}`);

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

    const range = req.headers.range;
    if (range && ext === '.mp4') {
      const [s, e]   = range.replace(/bytes=/, '').split('-');
      const start    = parseInt(s, 10);
      const end      = e ? parseInt(e, 10) : stats.size - 1;
      const chunkLen = end - start + 1;
      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${stats.size}`,
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
  console.log(`║  🌐  http://localhost:${PORT}                            ║`);
  console.log(`║  🗄️   SQLite DB: ${stats.total} video (${stats.mp4} MP4 + ${stats.youtube} YouTube) ║`);
  console.log(`║  ⚡  Short videolar: ${stats.shorts}                             ║`);
  console.log('║  📡  /api/videos   /api/shorts   /api/search        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
});

setInterval(() => {
  lastAgentRun = 0;
  runAgentRefresh().catch(console.error);
}, AGENT_TTL);

process.on('SIGINT', () => {
  console.log('\n[Server] Kapatılıyor...');
  db.close();
  process.exit(0);
});
