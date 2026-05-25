const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web';
const finalVideosPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\final_65_videos.json';
const allVideos = JSON.parse(fs.readFileSync(finalVideosPath, 'utf8'));

// Generate static arrays
const serverArrayStr = "const SEED_VIDEOS = " + JSON.stringify(allVideos, null, 2) + ";";
const clientArrayStr = "const LOCAL_VIDEOS = " + JSON.stringify(allVideos, null, 2) + ";";

const serverJsPath = path.join(projectDir, 'server.js');
const videosJsPath = path.join(projectDir, 'videos.js');

// 1. Rebuild server.js using \x60 for backticks to prevent parse errors
const originalServerHead = '/**\n' +
' * ÇOCUK DÜNYASI - BACKEND AGENT v4.0 (SQLite Destekli)\n' +
' * =====================================================\n' +
' * 🗄️ SQLite veritabanı — internet olmadan çalışır\n' +
' * 🤖 YouTube RSS agent — her 5 dk yeni video çeker\n' +
' * 📡 /api/videos, /api/shorts, /api/search, /api/status\n' +
' */\n\n' +
'const http         = require(\'http\');\n' +
'const https        = require(\'https\');\n' +
'const fs           = require(\'fs\');\n' +
'const path         = require(\'path\');\n' +
'const Database     = require(\'better-sqlite3\');\n\n' +
'const PORT    = 8080;\n' +
'const DB_FILE = path.join(__dirname, \'videos.db\');\n\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// KÜRATÖRLÜ VİDEO LİSTESİ (Test edilmiş — tümü çalışır)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// UZAKTAN İNDİRİLECEK ORİJİNAL MP4 LİNKLERİ (CORS & İnternetsiz çalışma için)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'const REMOTE_VIDEO_URLS = {\n' +
'  "sintel-cartoon": "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",\n' +
'  "oceans-video": "https://vjs.zencdn.net/v/oceans.mp4",\n' +
'  "big-buck-bunny": "https://test-videos.co.uk/vids/big_buck_bunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",\n' +
'  "elephants-dream": "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",\n' +
'  "sample-nature": "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",\n' +
'  "tears-of-steel": "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",\n' +
'  "bigger-fun": "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",\n' +
'  "bigger-joyrides": "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",\n' +
'  "bigger-escapes": "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",\n' +
'  "bigger-blazes": "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4"\n' +
'};\n\n' +
'const PRIMARY_VIDEOS = [\n' +
'  { id: "sintel-cartoon", url: "/local_videos/sintel-cartoon.mp4", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&auto=format&fit=crop" },\n' +
'  { id: "oceans-video", url: "/local_videos/oceans-video.mp4", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },\n' +
'  { id: "big-buck-bunny", url: "/local_videos/big-buck-bunny.mp4", thumbnail: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop" },\n' +
'  { id: "elephants-dream", url: "/local_videos/elephants-dream.mp4", thumbnail: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop" },\n' +
'  { id: "sample-nature", url: "/local_videos/sample-nature.mp4", thumbnail: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop" },\n' +
'  { id: "tears-of-steel", url: "/local_videos/tears-of-steel.mp4", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-fun", url: "/local_videos/bigger-fun.mp4", thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-joyrides", url: "/local_videos/bigger-joyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-escapes", url: "/local_videos/bigger-escapes.mp4", thumbnail: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-blazes", url: "/local_videos/bigger-blazes.mp4", thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop" }\n' +
'];\n';

const originalServerTail = '\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// 🗄️ SQLite VERİTABANI BAŞLATICI\n' +
'// ─────────────────────────────────────────────────────────\n' +
'let db;\n' +
'function initDatabase() {\n' +
'  db = new Database(DB_FILE);\n' +
'\n' +
'  // WAL modu (daha hızlı okuma/yazma)\n' +
'  db.pragma(\'journal_mode = WAL\');\n' +
'\n' +
'  // Tablo oluştur\n' +
'  db.exec(\x60\n' +
'    CREATE TABLE IF NOT EXISTS videos (\n' +
'      id         TEXT PRIMARY KEY,\n' +
'      title      TEXT NOT NULL,\n' +
'      desc       TEXT,\n' +
'      url        TEXT,\n' +
'      youtubeId  TEXT,\n' +
'      thumbnail  TEXT,\n' +
'      category   TEXT DEFAULT \'cartoons\',\n' +
'      duration   TEXT DEFAULT \'medium\',\n' +
'      badge      TEXT,\n' +
'      keywords   TEXT,\n' +
'      source     TEXT DEFAULT \'curated\',\n' +
'      created_at INTEGER DEFAULT (strftime(\'%s\',\'now\'))\n' +
'    );\n' +
'\n' +
'    CREATE TABLE IF NOT EXISTS settings (\n' +
'      key   TEXT PRIMARY KEY,\n' +
'      value TEXT\n' +
'    );\n' +
'  \x60);\n' +
'\n' +
'  // Mevcut eski YouTube ve RSS kayıtlarını tamamen sil, sadece 65 sabit video kalsın!\n' +
'  db.exec("DELETE FROM videos");\n' +
'\n' +
'  // Seed verilerini ekle (varsa güncelle, yoksa ekle)\n' +
'  const insertVideo = db.prepare(\x60\n' +
'    INSERT OR REPLACE INTO videos\n' +
'      (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)\n' +
'    VALUES\n' +
'      (@id, @title, @desc, @url, @youtubeId, @thumbnail, @category, @duration, @badge, @keywords, @source)\n' +
'  \x60);\n' +
'\n' +
'  const insertMany = db.transaction((videos) => {\n' +
'    for (const v of videos) {\n' +
'      insertVideo.run({\n' +
'        ...v,\n' +
'        keywords: (v.keywords || [v.title.toLowerCase()]).join(\',\'),\n' +
'        source: \'curated\',\n' +
'      });\n' +
'    }\n' +
'  });\n' +
'\n' +
'  insertMany(SEED_VIDEOS);\n' +
'\n' +
'  const count = db.prepare(\'SELECT COUNT(*) as n FROM videos\').get();\n' +
'  console.log(\x60[🗄️  SQLite] Veritabanı hazır: \${count.n} video (50 Short + 15 Normal)\x60);\n' +
'  return db;\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// VERİTABANI SORGU YARDIMCILARI\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function dbGetVideos({ category, duration, q } = {}) {\n' +
'  let sql    = \'SELECT * FROM videos WHERE 1=1\';\n' +
'  const args = [];\n' +
'\n' +
'  if (category && category !== \'all\' && category !== \'shorts\') {\n' +
'    sql += \' AND category = ?\';\n' +
'    args.push(category);\n' +
'  }\n' +
'  if (category === \'shorts\' || duration === \'short\') {\n' +
'    sql += " AND duration = \'short\'";\n' +
'  }\n' +
'  if (q) {\n' +
'    sql += \' AND (LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(keywords) LIKE ?)\';\n' +
'    const like = \x60%\x60 + q.toLowerCase() + \x60%\x60;\n' +
'    args.push(like, like, like);\n' +
'  }\n' +
'\n' +
'  sql += \' ORDER BY source DESC, created_at DESC\';\n' +
'  return db.prepare(sql).all(...args).map(dbRowToVideo);\n' +
'}\n' +
'\n' +
'function dbSearch(q) {\n' +
'  const like = \x60%\x60 + q.toLowerCase() + \x60%\x60;\n' +
'  return db.prepare(\x60\n' +
'    SELECT * FROM videos\n' +
'    WHERE LOWER(title) LIKE ? OR LOWER(desc) LIKE ? OR LOWER(keywords) LIKE ?\n' +
'    ORDER BY source DESC\n' +
'  \x60).all(like, like, like).map(dbRowToVideo);\n' +
'}\n' +
'\n' +
'function dbGetStats() {\n' +
'  return {\n' +
'    total:   db.prepare("SELECT COUNT(*) as n FROM videos").get().n,\n' +
'    mp4:     db.prepare("SELECT COUNT(*) as n FROM videos WHERE url IS NOT NULL AND url != \'\'").get().n,\n' +
'    youtube: db.prepare("SELECT COUNT(*) as n FROM videos WHERE youtubeId IS NOT NULL AND youtubeId != \'\'").get().n,\n' +
'    shorts:  db.prepare("SELECT COUNT(*) as n FROM videos WHERE duration=\'short\'").get().n,\n' +
'    rss:     db.prepare("SELECT COUNT(*) as n FROM videos WHERE source=\'rss\'").get().n,\n' +
'  };\n' +
'}\n' +
'\n' +
'function dbRowToVideo(row) {\n' +
'  return {\n' +
'    id:        row.id,\n' +
'    title:     row.title,\n' +
'    desc:      row.desc,\n' +
'    url:       row.url || undefined,\n' +
'    youtubeId: row.youtubeId || undefined,\n' +
'    thumbnail: row.thumbnail,\n' +
'    category:  row.category,\n' +
'    duration:  row.duration,\n' +
'    badge:     row.badge,\n' +
'    keywords:  row.keywords ? row.keywords.split(\',\') : [],\n' +
'  };\n' +
'}\n' +
'\n' +
'// Yeni video ekle (RSS\'den gelen)\n' +
'function dbInsertRSSVideo(video) {\n' +
'  try {\n' +
'    db.prepare(\x60\n' +
'      INSERT OR IGNORE INTO videos\n' +
'        (id, title, desc, url, youtubeId, thumbnail, category, duration, badge, keywords, source)\n' +
'      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'rss\')\n' +
'    \x60).run(\n' +
'      video.id, video.title, video.desc,\n' +
'      video.url || null, video.youtubeId || null,\n' +
'      video.thumbnail, video.category, video.duration,\n' +
'      video.badge, (video.keywords || []).join(\',\')\n' +
'    );\n' +
'    return true;\n' +
'  } catch(e) {\n' +
'    return false;\n' +
'  }\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// 🤖 YOUTUBE RSS AGENT\n' +
'// ─────────────────────────────────────────────────────────\n' +
'const KIDS_CHANNELS = [\n' +
'  { name: "TRT Çocuk", id: "UC2J-uK-mQ7gGZ6_WJ4uOqfA", category: "cartoons" },\n' +
'  { name: "Kukuli",    id: "UCqCqKMBkpfhYiGLCZJP0lPA",  category: "songs"   },\n' +
'  { name: "Adisebaba", id: "UC2o7dBpFnm6bHH5qdHHluIg",  category: "songs"   },\n' +
'];\n' +
'\n' +
'let lastAgentRun = 0;\n' +
'const AGENT_TTL  = 5 * 60 * 1000;\n' +
'\n' +
'function fetchRSS(channelId) {\n' +
'  return new Promise((resolve, reject) => {\n' +
'    const req = https.request({\n' +
'      hostname: \'www.youtube.com\',\n' +
'      path:     \x60/feeds/videos.xml?channel_id=\x60 + channelId,\n' +
'      method:   \'GET\',\n' +
'      timeout:  8000,\n' +
'      headers:  { \'User-Agent\': \'CocukDunyasi/4.0\' },\n' +
'    }, res => {\n' +
'      let data = \'\';\n' +
'      res.on(\'data\', c => data += c);\n' +
'      res.on(\'end\', () => resolve(data));\n' +
'    });\n' +
'    req.on(\'error\',   reject);\n' +
'    req.on(\'timeout\', () => { req.destroy(); reject(new Error(\'RSS timeout\')); });\n' +
'    req.end();\n' +
'  });\n' +
'}\n' +
'\n' +
'function parseRSS(xml, channelName, category) {\n' +
'  const results = [];\n' +
'  xml.split(\'<entry>\').slice(1).forEach(entry => {\n' +
'    const idM    = entry.match(/<yt:videoId>([^<]+)<\\/yt:videoId>/);\n' +
'    const titleM = entry.match(/<title>([^<]+)<\\/title>/);\n' +
'    const thumbM = entry.match(/<media:thumbnail url="([^"]+)"/);\n' +
'    const descM  = entry.match(/<media:description>([^<]{0,100})/);\n' +
'    if (!idM || !titleM) return;\n' +
'    const vid = idM[1].trim();\n' +
'    results.push({\n' +
'      id:        \x60rss-\x60 + vid,\n' +
'      title:     titleM[1].trim(),\n' +
'      desc:      descM ? descM[1] + \'...\' : channelName + \'\\\'den yeni video!\',\n' +
'      youtubeId: vid,\n' +
'      thumbnail: thumbM ? thumbM[1] : \x60https://img.youtube.com/vi/\x60 + vid + \x60/hqdefault.jpg\x60,\n' +
'      category,\n' +
'      duration:  \'medium\',\n' +
'      badge:     \x60🤖 Ajan • \x60 + channelName,\n' +
'      keywords:  [titleM[1].toLowerCase(), channelName.toLowerCase()],\n' +
'    });\n' +
'  });\n' +
'  return results.slice(0, 5);\n' +
'}\n' +
'\n' +
'async function runAgentRefresh() {\n' +
'  // YouTube RSS Agent devre dışı bırakıldı (sadece sabit yerel videolar kullanılacak)\n' +
'  return;\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// DOSYA İNDİRME VE PROXY YARDIMCILARI (CORS ve Çevrimdışı Çalışma)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function proxyRemoteVideo(videoUrl, req, res) {\n' +
'  console.log(\x60[Server Proxy] İndirilmeyen video için proxy başlatılıyor: \x60 + videoUrl);\n' +
'  const clientModule = videoUrl.startsWith(\'https\') ? https : http;\n' +
'  \n' +
'  const headers = { \'User-Agent\': \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\' };\n' +
'  if (req.headers.range) {\n' +
'    headers[\'Range\'] = req.headers.range;\n' +
'  }\n' +
'\n' +
'  const proxyReq = clientModule.get(videoUrl, { headers }, (proxyRes) => {\n' +
'    // CORS izinlerini ver ve başlıkları aktar\n' +
'    const resHeaders = { ...proxyRes.headers };\n' +
'    resHeaders[\'Access-Control-Allow-Origin\'] = \'*\';\n' +
'    resHeaders[\'Access-Control-Allow-Headers\'] = \'*\';\n' +
'    resHeaders[\'Access-Control-Expose-Headers\'] = \'*\';\n' +
'    \n' +
'    res.writeHead(proxyRes.statusCode, resHeaders);\n' +
'    proxyRes.pipe(res);\n' +
'  });\n' +
'\n' +
'  proxyReq.on(\'error\', (err) => {\n' +
'    console.error(\x60[Server Proxy] Proxy hatası (\x60 + videoUrl + \x60):\x60, err.message);\n' +
'    res.writeHead(500, { \'Content-Type\': \'text/plain; charset=utf-8\' });\n' +
'    res.end(\'Proxy Hatası: \' + err.message);\n' +
'  });\n' +
'}\n' +
'\n' +
'function downloadFile(url, destPath) {\n' +
'  return new Promise((resolve, reject) => {\n' +
'    const file = fs.createWriteStream(destPath + \'.tmp\');\n' +
'    let request;\n' +
'\n' +
'    const get = (requestUrl, depth = 0) => {\n' +
'      if (depth > 5) {\n' +
'        file.close();\n' +
'        fs.unlink(destPath + \'.tmp\', () => {});\n' +
'        reject(new Error(\'Çok fazla yönlendirme (Redirect Loop)\'));\n' +
'        return;\n' +
'      }\n' +
'\n' +
'      const clientModule = requestUrl.startsWith(\'https\') ? https : http;\n' +
'      request = clientModule.get(requestUrl, {\n' +
'        headers: { \'User-Agent\': \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\' }\n' +
'      }, (res) => {\n' +
'        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {\n' +
'          const redirectUrl = res.headers.location;\n' +
'          res.resume();\n' +
'          get(redirectUrl, depth + 1);\n' +
'          return;\n' +
'        }\n' +
'\n' +
'        if (res.statusCode !== 200) {\n' +
'          file.close();\n' +
'          fs.unlink(destPath + \'.tmp\', () => {});\n' +
'          reject(new Error(\x60Sunucu durum kodu: \x60 + res.statusCode));\n' +
'          return;\n' +
'        }\n' +
'\n' +
'        res.pipe(file);\n' +
'\n' +
'        file.on(\'finish\', () => {\n' +
'          file.close(() => {\n' +
'            fs.rename(destPath + \'.tmp\', destPath, (err) => {\n' +
'              if (err) reject(err);\n' +
'              else resolve();\n' +
'            });\n' +
'          });\n' +
'        });\n' +
'      });\n' +
'\n' +
'      request.on(\'error\', (err) => {\n' +
'        file.close();\n' +
'        fs.unlink(destPath + \'.tmp\', () => {});\n' +
'        reject(err);\n' +
'      });\n' +
'\n' +
'      request.setTimeout(45000, () => {\n' +
'        request.destroy();\n' +
'        file.close();\n' +
'        fs.unlink(destPath + \'.tmp\', () => {});\n' +
'        reject(new Error(\'Zaman aşımı (Timeout - 45s)\'));\n' +
'      });\n' +
'    };\n' +
'\n' +
'    get(url);\n' +
'  });\n' +
'}\n' +
'\n' +
'async function downloadLocalVideos() {\n' +
'  const dir = path.join(__dirname, \'local_videos\');\n' +
'  if (!fs.existsSync(dir)) {\n' +
'    fs.mkdirSync(dir, { recursive: true });\n' +
'  }\n' +
'\n' +
'  console.log(\'[Disk Downloader] Yerel MP4 videoları kontrol ediliyor...\');\n' +
'  \n' +
'  for (const [id, url] of Object.entries(REMOTE_VIDEO_URLS)) {\n' +
'    const dest = path.join(dir, id + \'.mp4\');\n' +
'    \n' +
'    if (fs.existsSync(dest)) {\n' +
'      try {\n' +
'        const stats = fs.statSync(dest);\n' +
'        if (stats.size > 100 * 1024) { // En az 100KB ise geçerli sayalım\n' +
'          console.log(\x60[Disk Downloader] \x60 + id + \x60.mp4 zaten diskte hazır.\x60);\n' +
'          continue;\n' +
'        }\n' +
'      } catch(e) {}\n' +
'    }\n' +
'    \n' +
'    console.log(\x60[Disk Downloader] 📥 \x60 + id + \x60 arka planda indirilmeye başlandı...\x60);\n' +
'    downloadFile(url, dest)\n' +
'      .then(() => {\n' +
'        console.log(\x60[Disk Downloader] 🏆 \x60 + id + \x60.mp4 başarıyla diskte depolandı! (CORS\\\'suz ve internetsiz oynatıma hazır)\x60);\n' +
'      })\n' +
'      .catch((err) => {\n' +
'        console.error(\x60[Disk Downloader] ❌ \x60 + id + \x60.mp4 indirilemedi:\x60, err.message);\n' +
'      });\n' +
'  }\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// HTTP SUNUCUSU\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function sendJSON(res, data, status = 200) {\n' +
'  const body = JSON.stringify(data);\n' +
'  res.writeHead(status, {\n' +
'    \'Content-Type\':  \'application/json; charset=utf-8\',\n' +
'    \'Access-Control-Allow-Origin\': \'*\',\n' +
'    \'Cache-Control\': \'no-cache\',\n' +
'  });\n' +
'  res.end(body);\n' +
'}\n' +
'\n' +
'const server = require(\'http\').createServer(async (req, res) => {\n' +
'  const parsed   = new URL(req.url, \x60http://localhost:\x60 + PORT);\n' +
'  const pathname = parsed.pathname;\n' +
'\n' +
'  res.setHeader(\'Access-Control-Allow-Origin\', \'*\');\n' +
'  if (req.method === \'OPTIONS\') { res.writeHead(204); res.end(); return; }\n' +
'\n' +
'  console.log(\x60[Server] \x60 + req.method + \' \' + pathname);\n' +
'\n' +
'  // ── YEREL MP4 VİDEOLAR İÇİN CORS/FALLBACK VE PROXY ─────\n' +
'  if (pathname.startsWith(\'/local_videos/\')) {\n' +
'    const filename = path.basename(pathname);\n' +
'    const id = filename.replace(\'.mp4\', \'\');\n' +
'    const localPath = path.join(__dirname, \'local_videos\', filename);\n' +
'\n' +
'    if (!fs.existsSync(localPath)) {\n' +
'      const remoteUrl = REMOTE_VIDEO_URLS[id];\n' +
'      if (remoteUrl) {\n' +
'        proxyRemoteVideo(remoteUrl, req, res);\n' +
'        return;\n' +
'      }\n' +
'    }\n' +
'  }\n' +
'\n' +
'  // ── API ROUTE\'LARI ─────────────────────────────────────\n' +
'  if (pathname === \'/api/videos\') {\n' +
'    runAgentRefresh().catch(() => {});\n' +
'    const list = dbGetVideos({\n' +
'      category: parsed.searchParams.get(\'category\') || \'all\',\n' +
'      duration: parsed.searchParams.get(\'duration\') || \'all\',\n' +
'      q:        parsed.searchParams.get(\'q\') || \'\',\n' +
'    });\n' +
'    return sendJSON(res, list);\n' +
'  }\n' +
'\n' +
'  if (pathname === \'/api/shorts\') {\n' +
'    runAgentRefresh().catch(() => {});\n' +
'    return sendJSON(res, dbGetVideos({ duration: \'short\' }));\n' +
'  }\n' +
'\n' +
'  if (pathname === \'/api/search\') {\n' +
'    const q = parsed.searchParams.get(\'q\') || \'\';\n' +
'    if (!q) return sendJSON(res, { error: \'q parametresi gerekli\' }, 400);\n' +
'    const results = dbSearch(q);\n' +
'    return sendJSON(res, results.length > 0 ? results : dbGetVideos().slice(0, 4));\n' +
'  }\n' +
'\n' +
'  if (pathname === \'/api/status\') {\n' +
'    const stats = dbGetStats();\n' +
'    return sendJSON(res, {\n' +
'      status:      \'running\',\n' +
'      version:     \'4.0\',\n' +
'      database:    \'SQLite (videos.db)\',\n' +
'      lastRefresh: new Date(lastAgentRun || Date.now()).toISOString(),\n' +
'      ...stats,\n' +
'    });\n' +
'  }\n' +
'\n' +
'  // ── STATİK DOSYALAR ────────────────────────────────────\n' +
'  let filePath = pathname === \'/\' ? \'./index.html\' : \'.\' + pathname;\n' +
'  filePath = path.resolve(__dirname, filePath);\n' +
'\n' +
'  if (!filePath.startsWith(__dirname)) {\n' +
'    res.writeHead(403); res.end(\'Forbidden\'); return;\n' +
'  }\n' +
'\n' +
'  fs.stat(filePath, (err, stats) => {\n' +
'    if (err || !stats.isFile()) {\n' +
'      res.writeHead(404, { \'Content-Type\': \'text/plain\' });\n' +
'      res.end(\'Not Found\');\n' +
'      return;\n' +
'    }\n' +
'\n' +
'    const ext = path.extname(filePath).toLowerCase();\n' +
'    const mime = {\n' +
'      \'.html\': \'text/html; charset=utf-8\',\n' +
'      \'.css\':  \'text/css; charset=utf-8\',\n' +
'      \'.js\':   \'application/javascript; charset=utf-8\',\n' +
'      \'.json\': \'application/json; charset=utf-8\',\n' +
'      \'.svg\':  \'image/svg+xml\',\n' +
'      \'.png\':  \'image/png\',\n' +
'      \'.jpg\':  \'image/jpeg\',\n' +
'      \'.mp4\':  \'video/mp4\',\n' +
'      \'.webmanifest\': \'application/manifest+json\',\n' +
'    };\n' +
'    const contentType = mime[ext] || \'application/octet-stream\';\n' +
'\n' +
'    // HTTP 206 Range desteği (MP4 streaming için kritik)\n' +
'    const range = req.headers.range;\n' +
'    if (range && ext === \'.mp4\') {\n' +
'      const [s, e]   = range.replace(/bytes=/, \'\').split(\'-\');\n' +
'      const start    = parseInt(s, 10);\n' +
'      const end      = e ? parseInt(e, 10) : stats.size - 1;\n' +
'      const chunkLen = end - start + 1;\n' +
'      res.writeHead(206, {\n' +
'        \'Content-Range\':  \x60bytes \x60 + start + \'-\' + end + \'/\' + stats.size,\n' +
'        \'Accept-Ranges\':  \'bytes\',\n' +
'        \'Content-Length\': chunkLen,\n' +
'        \'Content-Type\':   contentType,\n' +
'        \'Cache-Control\':  \'public, max-age=86400\',\n' +
'      });\n' +
'      fs.createReadStream(filePath, { start, end }).pipe(res);\n' +
'    } else {\n' +
'      res.writeHead(200, {\n' +
'        \'Content-Type\':   contentType,\n' +
'        \'Content-Length\': stats.size,\n' +
'        \'Cache-Control\':  \'public, max-age=3600\',\n' +
'      });\n' +
'      fs.createReadStream(filePath).pipe(res);\n' +
'    }\n' +
'  });\n' +
'});\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// BAŞLAT\n' +
'// ─────────────────────────────────────────────────────────\n' +
'initDatabase();\n' +
'runAgentRefresh().catch(() => {});\n' +
'downloadLocalVideos().catch(() => {});\n' +
'\n' +
'server.listen(PORT, \'0.0.0.0\', () => {\n' +
'  const stats = dbGetStats();\n' +
'  console.log(\'\');\n' +
'  console.log(\'╔══════════════════════════════════════════════════════╗\');\n' +
'  console.log(\'║  🤖 ÇOCUK DÜNYASI BACKEND AGENT v4.0 (SQLite)       ║\');\n' +
'  console.log(\x60║  🌐  http://localhost:\x60 + PORT + \'                            ║\');\n' +
'  console.log(\x60║  🗄️   SQLite DB: \x60 + stats.total + \x60 video (\x60 + stats.mp4 + \x60 MP4 + \x60 + stats.youtube + \x60 YouTube) ║\x60);\n' +
'  console.log(\x60║  ⚡  Short videolar: \x60 + stats.shorts + \'                             ║\');\n' +
'  console.log(\'║  📡  /api/videos   /api/shorts   /api/search        ║\');\n' +
'  console.log(\'╚══════════════════════════════════════════════════════╝\');\n' +
'});\n' +
'\n' +
'// Her 5 dakika RSS yenile\n' +
'setInterval(() => {\n' +
'  lastAgentRun = 0;\n' +
'  runAgentRefresh().catch(console.error);\n' +
'}, AGENT_TTL);\n' +
'\n' +
'// Graceful shutdown\n' +
'process.on(\'SIGINT\', () => {\n' +
'  console.log(\'\\n[Server] Kapatılıyor...\');\n' +
'  db.close();\n' +
'  process.exit(0);\n' +
'});\n';

// 2. Rebuild videos.js using \x60 for backticks
const originalVideosHead = '/**\n' +
' * ÇOCUK DÜNYASI - VİDEO MODÜLÜ v4.0\n' +
' * ================================================\n' +
' * DÜZELTMELER:\n' +
' *  - Eski localStorage cache\'leri temizlenir\n' +
' *  - VIDEO_DATABASE global ve doğru güncellenir\n' +
' *  - Short video kategorisi tam çalışır\n' +
' *  - Tüm 5 MP4 video açılır\n' +
' *  - YouTube IFrame API ile embed oynatma\n' +
' *  - YouTube hatası → "YouTube\'da Aç" butonu\n' +
' * ================================================\n' +
' */\n\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// ESKİ CACHE TEMİZLEME (localStorage v1/v2/v3 temizle)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'(function clearOldCaches() {\n' +
'  [\'cached_agent_videos\', \'cached_agent_videos_v2\', \'agent_videos_v2\', \'agent_videos_v3\'].forEach(k => {\n' +
'    localStorage.removeItem(k);\n' +
'  });\n' +
'})();\n\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// YEREL FALLBACK VERİTABANI (sunucu kapalıyken de çalışır)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'const PRIMARY_VIDEOS = [\n' +
'  { id: "sintel-cartoon", url: "/local_videos/sintel-cartoon.mp4", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&auto=format&fit=crop" },\n' +
'  { id: "oceans-video", url: "/local_videos/oceans-video.mp4", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },\n' +
'  { id: "big-buck-bunny", url: "/local_videos/big-buck-bunny.mp4", thumbnail: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop" },\n' +
'  { id: "elephants-dream", url: "/local_videos/elephants-dream.mp4", thumbnail: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop" },\n' +
'  { id: "sample-nature", url: "/local_videos/sample-nature.mp4", thumbnail: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop" },\n' +
'  { id: "tears-of-steel", url: "/local_videos/tears-of-steel.mp4", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-fun", url: "/local_videos/bigger-fun.mp4", thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-joyrides", url: "/local_videos/bigger-joyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-escapes", url: "/local_videos/bigger-escapes.mp4", thumbnail: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&auto=format&fit=crop" },\n' +
'  { id: "bigger-blazes", url: "/local_videos/bigger-blazes.mp4", thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop" }\n' +
'];\n';

const originalVideosTail = '\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// GLOBAL DURUM (Değişkenler)\n' +
'// ─────────────────────────────────────────────────────────\n' +
'const VIDEO_CACHE_NAME = \'cocuk-dunyasi-videos-v4\';\n' +
'let VIDEO_DATABASE     = [];      // Aktif video listesi\n' +
'let currentCategory    = \'all\';\n' +
'let currentFilteredList = [];\n' +
'let ytPlayer           = null;\n' +
'let ytAPIReady         = false;\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// YouTube IFrame API\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function loadYouTubeAPI() {\n' +
'  if (document.getElementById(\'yt-api-script\')) return;\n' +
'  const s  = document.createElement(\'script\');\n' +
'  s.id     = \'yt-api-script\';\n' +
'  s.src    = \'https://www.youtube.com/iframe_api\';\n' +
'  s.onerror = () => console.warn(\'[YT API] Yüklenemedi (internet yok?)\');\n' +
'  document.head.appendChild(s);\n' +
'}\n' +
'\n' +
'window.onYouTubeIframeAPIReady = () => {\n' +
'  ytAPIReady = true;\n' +
'  console.log(\'[Video] YouTube IFrame API hazır!\');\n' +
'};\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// MODÜL BAŞLATICI\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function initVideosModule() {\n' +
'  console.log(\'[Video] Modül v4.0 başlatılıyor...\');\n' +
'  loadYouTubeAPI();\n' +
'  loadVideosFromServer();\n' +
'\n' +
'  // Kategori sekmeleri\n' +
'  document.querySelectorAll(\'.category-tab\').forEach(tab => {\n' +
'    tab.addEventListener(\'click\', e => {\n' +
'      document.querySelectorAll(\'.category-tab\').forEach(t => t.classList.remove(\'active\'));\n' +
'      e.currentTarget.classList.add(\'active\');\n' +
'      currentCategory = e.currentTarget.dataset.category;\n' +
'      currentFilteredList = [...VIDEO_DATABASE];\n' +
'      applyAndRender();\n' +
'    });\n' +
'  });\n' +
'\n' +
'  // Ajan Çiko arama\n' +
'  const searchBtn   = document.getElementById(\'btn-agent-search\');\n' +
'  const searchInput = document.getElementById(\'agent-search-input\');\n' +
'  if (searchBtn && searchInput) {\n' +
'    searchBtn.addEventListener(\'click\', () => runChikoSearch(searchInput.value));\n' +
'    searchInput.addEventListener(\'keyup\', e => {\n' +
'      if (e.key === \'Enter\') runChikoSearch(searchInput.value);\n' +
'    });\n' +
'  }\n' +
'\n' +
'  // Player kapat\n' +
'  const closeBtn = document.getElementById(\'btn-close-player\');\n' +
'  if (closeBtn) closeBtn.addEventListener(\'click\', closeVideoPlayer);\n' +
'\n' +
'  updateDownloadStatuses();\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// SUNUCUDAN VİDEO YÜKLEYİCİ\n' +
'// ─────────────────────────────────────────────────────────\n' +
'async function loadVideosFromServer() {\n' +
'  // Önce local fallback ile hemen ekrana bas (0 gecikme)\n' +
'  VIDEO_DATABASE      = [...LOCAL_VIDEOS];\n' +
'  currentFilteredList = [...VIDEO_DATABASE];\n' +
'  applyAndRender();\n' +
'\n' +
'  // Sonra SQLite backend\'den taze listeyi çek\n' +
'  if (navigator.onLine) {\n' +
'    try {\n' +
'      const res   = await fetch(\'/api/videos\', { signal: AbortSignal.timeout(8000) });\n' +
'      const fresh = await res.json();\n' +
'      if (Array.isArray(fresh) && fresh.length > 0) {\n' +
'        VIDEO_DATABASE      = fresh;\n' +
'        currentFilteredList = [...VIDEO_DATABASE];\n' +
'        applyAndRender();\n' +
'        console.log(\x60[Video] Backend\\\'den \x60 + fresh.length + \x60 video yüklendi.\x60);\n' +
'      }\n' +
'    } catch(e) {\n' +
'      console.warn(\'[Video] Backend yüklemesi başarısız, yerel liste kullanılıyor:\', e.message);\n' +
'    }\n' +
'  }\n' +
'\n' +
'  updateDownloadStatuses();\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// AJAN ÇİKO ARAMA\n' +
'// ─────────────────────────────────────────────────────────\n' +
'async function runChikoSearch(rawQuery) {\n' +
'  const loaderEl = document.getElementById(\'agent-loading\');\n' +
'  const q        = rawQuery.trim().toLowerCase();\n' +
'\n' +
'  if (loaderEl) loaderEl.style.display = \'flex\';\n' +
'  if (typeof playPopSound === \'function\') { playPopSound(); setTimeout(() => playPopSound(), 150); }\n' +
'\n' +
'  await new Promise(r => setTimeout(r, 800)); // Minimum 0.8s animasyon\n' +
'\n' +
'  if (!q || q === \'hepsi\' || q === \'tümü\') {\n' +
'    currentFilteredList = [...VIDEO_DATABASE];\n' +
'  } else {\n' +
'    // Önce API\'den ara (SQLite full-text)\n' +
'    let results = null;\n' +
'    if (navigator.onLine) {\n' +
'      try {\n' +
'        const res = await fetch(\x60/api/search?q=\x60 + encodeURIComponent(q), { signal: AbortSignal.timeout(5000) });\n' +
'        results   = await res.json();\n' +
'      } catch(e) { /* offline fallback */ }\n' +
'    }\n' +
'\n' +
'    if (Array.isArray(results) && results.length > 0) {\n' +
'      currentFilteredList = results;\n' +
'    } else {\n' +
'      // Yerel fuzzy arama\n' +
'      currentFilteredList = VIDEO_DATABASE.filter(v => {\n' +
'        const s = [v.title, v.desc, ...(v.keywords || [])].join(\' \').toLowerCase();\n' +
'        return s.includes(q);\n' +
'      });\n' +
'      if (currentFilteredList.length === 0) {\n' +
'        currentFilteredList = VIDEO_DATABASE.slice(0, 4);\n' +
'        alert(\x60🐶 Hav! Ajan Çiko "\x60 + rawQuery.trim() + \x60" için bulamadı ama en eğlenceli videolar getirildi!\x60);\n' +
'      }\n' +
'    }\n' +
'  }\n' +
'\n' +
'  if (loaderEl) loaderEl.style.display = \'none\';\n' +
'  if (typeof playPopSound === \'function\') { playPopSound(); setTimeout(() => playPopSound(), 100); setTimeout(() => playPopSound(), 200); }\n' +
'  applyAndRender();\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// FİLTRE + RENDER UYGULA\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function applyAndRender() {\n' +
'  const favs = getFavorites();\n' +
'  let list   = [...currentFilteredList];\n' +
'\n' +
'  if (currentCategory === \'favorites\') {\n' +
'    list = list.filter(v => favs.includes(v.id));\n' +
'  } else if (currentCategory === \'shorts\') {\n' +
'    list = list.filter(v => v.duration === \'short\');\n' +
'  } else if (currentCategory !== \'all\') {\n' +
'    list = list.filter(v => v.category === currentCategory);\n' +
'  }\n' +
'\n' +
'  renderVideosList(list);\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// VIDEO KARTELERİ RENDER ET\n' +
'// ─────────────────────────────────────────────────────────\n' +
'async function renderVideosList(list) {\n' +
'  const catalog = document.getElementById(\'video-catalog\');\n' +
'  if (!catalog) return;\n' +
'  catalog.innerHTML = \'\';\n' +
'\n' +
'  const isOnline      = navigator.onLine;\n' +
'  const favs          = getFavorites();\n' +
'  const downloadedIds = await getDownloadedIds();\n' +
'\n' +
'  if (!list || list.length === 0) {\n' +
'    catalog.innerHTML = \x60\n' +
'      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:rgba(255,255,255,0.75);border-radius:20px;">\n' +
'        <div style="font-size:52px">🔍</div>\n' +
'        <h3 style="margin:12px 0 6px;color:var(--text-dark)">Video Bulunamadı</h3>\n' +
'        <p style="color:var(--text-light)">Ajan Çiko\\\'ya farklı şeyler aratabilir ya da kategorileri değiştirebilirsin.</p>\n' +
'      </div>\x60;\n' +
'    return;\n' +
'  }\n' +
'\n' +
'  list.forEach(video => {\n' +
'    const isYT         = !!(video.youtubeId);\n' +
'    const isMP4        = !!(video.url);\n' +
'    const isDownloaded = isMP4 && downloadedIds.includes(video.url);\n' +
'    const isFav        = favs.includes(video.id);\n' +
'    const isShort      = video.duration === \'short\';\n' +
'    const isDisabled   = !isOnline && isYT;\n' +
'\n' +
'    const card = document.createElement(\'div\');\n' +
'    card.className = \x60video-card\x60 + (isShort ? \' short-card\' : \'\') + (isDisabled ? \' offline-disabled\' : \'\');\n' +
'    card.id        = \x60video-card-\x60 + video.id;\n' +
'\n' +
'    // Çevrimdışı katmanı\n' +
'    const offlineOverlay = isDisabled ? \x60\n' +
'      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.88);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:inherit;gap:6px;">\n' +
'        <span style="font-size:32px">😴</span>\n' +
'        <span style="font-weight:700;font-size:12px;color:#374151">İnternet Gerekli</span>\n' +
'      </div>\x60 : \'\';\n' +
'\n' +
'    // Short rozet (sol üst)\n' +
'    const shortTag = isShort\n' +
'      ? \x60<span style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:3px 9px;border-radius:20px;z-index:15;box-shadow:0 2px 8px rgba(255,107,107,0.5);letter-spacing:0.5px;">⚡ SHORT</span>\x60\n' +
'      : \'\';\n' +
'\n' +
'    // Kategori rozet (sağ üst)\n' +
'    const catTag = \x60<span class="video-badge" style="\x60 + (isYT ? \'background:rgba(220,38,38,0.88)\' : \'background:rgba(21,128,61,0.9)\') + \x60">\x60 + (video.badge || \'\') + \x60</span>\x60;\n' +
'\n' +
'    // İndirme / YT butonu (sağ alt thumbnail)\n' +
'    const dlTag = isYT\n' +
'      ? \x60<span style="position:absolute;bottom:8px;right:8px;background:rgba(220,38,38,0.88);color:#fff;font-size:9px;font-weight:800;padding:3px 8px;border-radius:10px;z-index:15;">▶ YT</span>\x60\n' +
'      : \x60<button id="dl-btn-\x60 + video.id + \x60" title="\x60 + (isDownloaded ? \'Cihazda Kayıtlı\' : \'Çevrimdışı İndir\') + \x60"\n\' +\n' +
'        \'           style="position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);">\n\' +\n' +
'        \x60           \x60 + (isDownloaded ? \'📥\' : \'💾\') + \x60\n\' +\n' +
'        \'         </button>\x60;\n' +
'\n' +
'    // Favori butonu (sol alt thumbnail)\n' +
'    const favTag = \x60\n\' +\n' +
'      \'      <button class="fav-btn" style="position:absolute;bottom:8px;left:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);margin-bottom:0;\">\n\' +\n' +
'      \x60        \x60 + (isFav ? \'⭐\' : \'☆\') + \x60\n\' +\n' +
'      \'      </button>\x60;\n' +
'\n' +
'    card.innerHTML = \x60\n\' +\n' +
'      \x60      \x60 + offlineOverlay + \x60\n\' +\n' +
'      \x60      <div class="video-thumbnail-container" style="position:relative;cursor:\x60 + (isDisabled ? \'not-allowed\' : \'pointer\') + \x60;">\n\' +\n' +
'      \x60        \x60 + shortTag + \x60\n\' +\n' +
'      \x60        \x60 + catTag + \x60\n\' +\n' +
'      \x60        <img class="video-thumbnail" src="\x60 + video.thumbnail + \x60" alt="\x60 + video.title + \x60" loading="lazy"\n\' +\n' +
'      \'             onerror="this.src=\\\'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop\\\'">\n\' +\n' +
'      \'        <div class="play-overlay" style="display:flex;flex-direction:column;align-items:center;gap:4px;">\n\' +\n' +
'      \'          <span style="font-size:30px;line-height:1">▶</span>\n\' +\n' +
'      \x60          <span style="font-size:10px;background:rgba(0,0,0,0.6);padding:2px 10px;border-radius:12px;color:#fff;">\x60 + \n' +
'      \x60            \x60 + (isMP4 ? \'🎬 Hemen Oynat\' : \'▶ YouTube\\\'da İzle\') + \x60\n\' +\n' +
'      \'          </span>\n\' +\n' +
'      \'        </div>\n\' +\n' +
'      \x60        \x60 + favTag + \x60\n\' +\n' +
'      \x60        \x60 + dlTag + \x60\n\' +\n' +
'      \'      </div>\n\' +\n' +
'      \'      <div class="video-info">\n\' +\n' +
'      \x60        <h3 class="video-title">\x60 + video.title + \x60</h3>\n\' +\n' +
'      \x60        <p class="video-desc">\x60 + video.desc + \x60</p>\n\' +\n' +
'      \'        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;">\n\' +\n' +
'      \'          <span class="video-category">\n\' +\n' +
'      \x60            \x60 + (video.category === \'cartoons\' ? \'🐱 Çizgi Film\' : video.category === \'songs\' ? \'🎵 Şarkı\' : \'🧠 Eğitici\') + \x60\n\' +\n' +
'      \'          </span>\n\' +\n' +
'      \x60          \x60 + (isShort ? \'<span style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:12px;letter-spacing:0.3px;">⚡ SHORT</span>\' : \'\') + \x60\n\' +\n' +
'      \x60          \x60 + (isMP4 ? \'<span style="background:rgba(21,128,61,0.1);color:#15803d;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;border:1px solid rgba(21,128,61,0.2);">✅ MP4</span>\' : \'\') + \x60\n\' +\n' +
'      \'        </div>\n\' +\n' +
'      \'      </div>\x60;\n' +
'\n' +
'    // Thumbnail tıklama (oynat)\n' +
'    const thumb = card.querySelector(\'.video-thumbnail-container\');\n' +
'    if (!isDisabled) {\n' +
'      thumb.addEventListener(\'click\', () => playVideo(video.id));\n' +
'    }\n' +
'    // Favori butonu\n' +
'    card.querySelector(\'.fav-btn\')?.addEventListener(\'click\', e => {\n' +
'      e.stopPropagation();\n' +
'      toggleFavorite(video.id);\n' +
'    });\n' +
'\n' +
'    // İndirme butonu\n' +
'    card.querySelector(\x60#dl-btn-\x60 + video.id)?.addEventListener(\'click\', e => {\n' +
'      e.stopPropagation();\n' +
'      toggleDownload(video.id);\n' +
'    });\n' +
'\n' +
'    catalog.appendChild(card);\n' +
'  });\n' +
'\n' +
'  updateDownloadStatuses();\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// VİDEO OYNAT\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function playVideo(videoId) {\n' +
'  // VIDEO_DATABASE\'de bul\n' +
'  const video = VIDEO_DATABASE.find(v => v.id === videoId);\n' +
'  if (!video) {\n' +
'    console.error(\'[Video] ID bulunamadı:\', videoId, \'— DATABASE boyutu:\', VIDEO_DATABASE.length);\n' +
'    return;\n' +
'  }\n' +
'\n' +
'  const modal    = document.getElementById(\'player-modal\');\n' +
'  const mediaCon = document.getElementById(\'kids-media-container\');\n' +
'  const titleEl  = document.getElementById(\'player-title\');\n' +
'  if (!modal || !mediaCon) return;\n' +
'\n' +
'  titleEl.textContent = \x60🎬 \x60 + video.title;\n' +
'  \n' +
'  if (video.youtubeId) {\n' +
'    mediaCon.innerHTML = \x60\n\' +\n' +
'      \'      <div style="position:relative;width:100%;height:100%;background:#000;">\\n\' +\n' +
'      \x60        <iframe id="kids-youtube-iframe"\\n\x60 +\n' +
'      \x60          src="https://www.youtube.com/embed/\x60 + video.youtubeId + \x60?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"\\n\x60 +\n' +
'      \'          frameborder="0"\\n\' +\n' +
'      \'          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"\\n\' +\n' +
'      \'          allowfullscreen\\n\' +\n' +
'      \'          style="width:100%;height:100%;display:block;border:none;">\\n\' +\n' +
'      \'        </iframe>\\n\' +\n' +
'      \'      </div>\\n\' +\n' +
'      \'      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">\\n\' +\n' +
'      \'        <span style="color:#6B7280;font-size:11px;">❤️ Güvenli Çocuk YouTube Modu</span>\\n\' +\n' +
'      \x60        <a href="https://www.youtube.com/watch?v=\x60 + video.youtubeId + \x60" target="_blank"\\n\x60 +\n' +
'      \'           style="padding:5px 14px;background:#DC2626;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">\\n\' +\n' +
'      \'          ▶ YouTube\\\'da Aç ↗\\n\' +\n' +
'      \'        </a>\\n\' +\n' +
'      \'      </div>\x60;\n' +
'  } else {\n' +
'    mediaCon.innerHTML  = \x60\n\' +\n' +
'      \'      <video id="kids-video-player"\\n\' +\n' +
'      \'        controls autoplay playsinline\\n\' +\n' +
'      \'        style="width:100%;max-height:65vh;background:#000;display:block;border-radius:0;">\\n\' +\n' +
'      \x60        <source src="\x60 + video.url + \x60" type="video/mp4">\\n\x60 +\n' +
'      \'        <p style="color:#fff;padding:20px;text-align:center;">\\n\' +\n' +
'      \'          Video oynatılamadı. \\n\' +\n' +
'      \x60          <a href="\x60 + video.url + \x60" target="_blank" style="color:#FCD34D;">Doğrudan aç ↗</a>\\n\x60 +\n' +
'      \'        </p>\\n\' +\n' +
'      \'      </video>\\n\' +\n' +
'      \'      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">\\n\' +\n' +
'      \'        <span style="color:#6B7280;font-size:11px;">✅ Doğrudan MP4 oynatılıyor — Çevrimdışı indirilebilir</span>\\n\' +\n' +
'      \x60        <a href="\x60 + video.url + \x60" target="_blank" download\\n\x60 +\n' +
'      \'           style="padding:5px 14px;background:#059669;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">\\n\' +\n' +
'      \'          📥 İndir\\n\' +\n' +
'      \'        </a>\\n\' +\n' +
'      \'      </div>\x60;\n' +
'  }\n' +
'\n' +
'  const vEl = mediaCon.querySelector(\'#kids-video-player\');\n' +
'  vEl?.addEventListener(\'error\', () => {\n' +
'    mediaCon.innerHTML = \x60\n\' +\n' +
'      \'      <div style="background:#111827;padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;">\\n\' +\n' +
'      \'        <span style="font-size:44px">😔</span>\\n\' +\n' +
'      \'        <p style="color:#9CA3AF">Video yüklenemedi.</p>\\n\' +\n' +
'      \x60        <a href="\x60 + video.url + \x60" target="_blank"\\n\x60 +\n' +
'      \'           style="padding:12px 28px;background:#059669;color:#fff;border-radius:50px;font-weight:700;text-decoration:none;">\\n\' +\n' +
'      \'          🔗 Doğrudan Aç\\n\' +\n' +
'      \'        </a>\\n\' +\n' +
'      \'      </div>\x60;\n' +
'  });\n' +
'\n' +
'  modal.classList.add(\'active\');\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// PLAYER KAPAT\n' +
'// ─────────────────────────────────────────────────────────\n' +
'function closeVideoPlayer() {\n' +
'  if (ytPlayer) { try { ytPlayer.destroy(); } catch(e) {} ytPlayer = null; }\n' +
'  const mc = document.getElementById(\'kids-media-container\');\n' +
'  if (mc) mc.innerHTML = \'\';\n' +
'  document.getElementById(\'player-modal\')?.classList.remove(\'active\');\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// ÇEVRIMDIŞI İNDİRME\n' +
'// ─────────────────────────────────────────────────────────\n' +
'async function toggleDownload(videoId) {\n' +
'  const video = VIDEO_DATABASE.find(v => v.id === videoId);\n' +
'  if (!video?.url) return;\n' +
'\n' +
'  const btn  = document.getElementById(\x60dl-btn-\x60 + video.id);\n' +
'  const dIds = await getDownloadedIds();\n' +
'  const isDl = dIds.includes(video.url);\n' +
'\n' +
'  if (isDl) {\n' +
'    if (!confirm(\x60"\x60 + video.title + \x60" çevrimdışı hafızadan silinsin mi?\x60)) return;\n' +
'    const cache = await caches.open(VIDEO_CACHE_NAME);\n' +
'    await cache.delete(video.url);\n' +
'    if (navigator.serviceWorker && navigator.serviceWorker.controller) {\n' +
'      navigator.serviceWorker.controller.postMessage({\n' +
'        type: \'VIDEO_CACHE_UPDATED\',\n' +
'        action: \'delete\',\n' +
'        url: new URL(video.url, window.location.origin).href\n' +
'      });\n' +
'    }\n' +
'    if (btn) { btn.innerHTML = \'💾\'; btn.title = \'Çevrimdışı İndir\'; }\n' +
'    applyAndRender();\n' +
'  } else {\n' +
'    if (!navigator.onLine) { alert(\'⚠️ İndirmek için internet gerekli.\'); return; }\n' +
'    if (btn) btn.innerHTML = \'⌛\';\n' +
'    try {\n' +
'      const cache = await caches.open(VIDEO_CACHE_NAME);\n' +
'      const r     = await fetch(video.url);\n' +
'      if (r.ok) {\n' +
'        await cache.put(video.url, r);\n' +
'        if (navigator.serviceWorker && navigator.serviceWorker.controller) {\n' +
'          navigator.serviceWorker.controller.postMessage({\n' +
'            type: \'VIDEO_CACHE_UPDATED\',\n' +
'            action: \'add\',\n' +
'            url: new URL(video.url, window.location.origin).href\n' +
'          });\n' +
'        }\n' +
'        if (btn) { btn.innerHTML = \'📥\'; btn.title = \'Cihazda Kayıtlı\'; }\n' +
'        applyAndRender();\n' +
'      } else throw new Error(\'HTTP \' + r.status);\n' +
'    } catch(e) {\n' +
'      alert(\'⚠️ İndirme başarısız. İnternet bağlantısını kontrol et.\');\n' +
'      if (btn) btn.innerHTML = \'💾\';\n' +
'    }\n' +
'  }\n' +
'  if (typeof updateCacheUsageStats === \'function\') updateCacheUsageStats();\n' +
'}\n' +
'\n' +
'// ─────────────────────────────────────────────────────────\n' +
'// YARDIMCILAR\n' +
'// ─────────────────────────────────────────────────────────\n' +
'async function updateDownloadStatuses() {\n' +
'  const ids = await getDownloadedIds();\n' +
'  VIDEO_DATABASE.filter(v => v.url).forEach(v => {\n' +
'    const btn = document.getElementById(\x60dl-btn-\x60 + v.id);\n' +
'    if (!btn) return;\n' +
'    const dl = ids.includes(v.url);\n' +
'    btn.innerHTML = dl ? \'📥\' : \'💾\';\n' +
'    btn.title     = dl ? \'Cihazda Kayıtlı\' : \'Çevrimdışı İndir\';\n' +
'  });\n' +
'}\n' +
'\n' +
'async function getDownloadedIds() {\n' +
'  try {\n' +
'    const cache = await caches.open(VIDEO_CACHE_NAME);\n' +
'    return (await cache.keys()).map(r => r.url);\n' +
'  } catch { return []; }\n' +
'}\n' +
'\n' +
'function getFavorites() {\n' +
'  try { return JSON.parse(localStorage.getItem(\'kids_video_favorites\') || \'[]\'); }\n' +
'  catch { return []; }\n' +
'}\n' +
'\n' +
'function toggleFavorite(videoId) {\n' +
'  let favs = getFavorites();\n' +
'  favs = favs.includes(videoId) ? favs.filter(id => id !== videoId) : [...favs, videoId];\n' +
'  localStorage.setItem(\'kids_video_favorites\', JSON.stringify(favs));\n' +
'  applyAndRender();\n' +
'}\n' +
'\n' +
'// app.js uyumluluk\n' +
'function renderVideos(category) {\n' +
'  currentCategory     = category || \'all\';\n' +
'  currentFilteredList = [...VIDEO_DATABASE];\n' +
'  applyAndRender();\n' +
'}\n';

// Write clean patched files
const serverContent = originalServerHead + '\n' + serverArrayStr + '\n' + originalServerTail;
fs.writeFileSync(serverJsPath, serverContent, 'utf8');
console.log('Safe server.js write complete!');

const videosContent = originalVideosHead + '\n' + clientArrayStr + '\n' + originalVideosTail;
fs.writeFileSync(videosJsPath, videosContent, 'utf8');
console.log('Safe videos.js write complete!');
