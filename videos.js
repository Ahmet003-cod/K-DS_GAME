/**
 * ÇOCUK DÜNYASI - VİDEO MODÜLÜ v4.0 (Swipe Destekli)
 * ================================================
 * ÖZELLİKLER:
 *  - Mobil ve masaüstü kaydırma (swipe up/down/left/right) hareket desteği.
 *  - Yumuşak kayma ve sıçrama (bounce) animasyonları ile video geçişleri.
 *  - Ekranda beliren sevimli, animasyonlu kılavuz rozetleri.
 *  - SQLite backend'den dinamik video listesi yükleme.
 *  - Güvenli çocuk YouTube modlu IFrame embed oynatma.
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
// GLOBAL DURUM (Değişkenler)
// ─────────────────────────────────────────────────────────
const VIDEO_CACHE_NAME = 'cocuk-dunyasi-videos-v4';
let VIDEO_DATABASE     = [];      // Aktif video listesi
let currentCategory    = 'all';
let currentFilteredList = [];
let ytPlayer           = null;
let ytAPIReady         = false;
let currentPlayingVideoId = null; // Şu an oynatılan video ID'si

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

  // ── MOBİL VE MASAÜSTÜ KAYDIRMA (SWIPE) HAREKETLERİ BAĞLANTISI ──
  (function setupSwipeGestures() {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchEndY = 0;
    let touchEndX = 0;
    let isSwiping = false;

    const modal = document.getElementById('player-modal');
    if (!modal) return;

    // Mobil dokunmatik kaydırma
    modal.addEventListener('touchstart', e => {
      touchStartY = e.changedTouches[0].screenY;
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
    }, { passive: true });

    modal.addEventListener('touchend', e => {
      if (!isSwiping) return;
      isSwiping = false;
      touchEndY = e.changedTouches[0].screenY;
      touchEndX = e.changedTouches[0].screenX;
      processSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });

    // Masaüstü fare sürükleme ile test edebilmek için mouse kaydırma
    let isMouseDown = false;
    modal.addEventListener('mousedown', e => {
      if (e.target.closest('.close-player') || e.target.closest('a') || e.target.closest('button')) return;
      isMouseDown = true;
      touchStartY = e.screenY;
      touchStartX = e.screenX;
    });

    modal.addEventListener('mouseup', e => {
      if (!isMouseDown) return;
      isMouseDown = false;
      touchEndY = e.screenY;
      touchEndX = e.screenX;
      processSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    });
    
    // Sıçrama (Bounce) animasyonu için CSS yerleştir
    if (!document.getElementById('kids-swipe-styles')) {
      const style = document.createElement('style');
      style.id = 'kids-swipe-styles';
      style.textContent = `
        @keyframes kidsBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
  })();
}

// ─────────────────────────────────────────────────────────
// YEREL VİDEO YÜKLEYİCİ (NETLIFY & STATIK ICIN)
// ─────────────────────────────────────────────────────────
async function loadVideosFromServer() {
  // Sadece local_videos.js fallback veritabanıyla (LOCAL_VIDEOS) yükle
  if (typeof LOCAL_VIDEOS !== 'undefined') {
    // 🎲 GÜNLÜK KARIŞTIRICI (Daily Shuffle Algoritması)
    // Her gün sıfırdan aynı gün için aynı, ertesi gün farklı bir sıra üretir.
    const todayStr = new Date().toDateString();
    let hash = 0;
    for(let i = 0; i < todayStr.length; i++) {
      hash = Math.imul(31, hash) + todayStr.charCodeAt(i) | 0;
    }
    
    let seed = Math.abs(hash) || 1;
    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    let shuffled = [...LOCAL_VIDEOS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    VIDEO_DATABASE      = shuffled;
    currentFilteredList = [...VIDEO_DATABASE];
    applyAndRender();
  } else {
    console.warn('[Video] LOCAL_VIDEOS bulunamadı! Lütfen video_data.js dosyasının yüklendiğinden emin olun.');
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

  await new Promise(r => setTimeout(r, 800)); // Minimum 0.8s sevimli yükleme süresi

  if (!q || q === 'hepsi' || q === 'tümü') {
    currentFilteredList = [...VIDEO_DATABASE];
  } else {
    // Sadece Yerel fuzzy arama (Netlify uyumlu)
    currentFilteredList = VIDEO_DATABASE.filter(v => {
      const s = [v.title, v.desc, ...(v.keywords || [])].join(' ').toLowerCase();
      return s.includes(q);
    });
    if (currentFilteredList.length === 0) {
      currentFilteredList = VIDEO_DATABASE.slice(0, 4);
      alert(`🐶 Hav! Ajan Çiko "${rawQuery.trim()}" için aradığını bulamadı ama en tatlı videoları getirdi!`);
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

  // Çevrimdışı isek sadece indirilenleri göster
  if (!isOnline) {
    list = list.filter(video => video.url && downloadedIds.includes(video.url));
  }

  if (!list || list.length === 0) {
    catalog.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:rgba(255,255,255,0.75);border-radius:20px;">
        <div style="font-size:52px">😴</div>
        <h3 style="margin:12px 0 6px;color:var(--text-dark)">İnternet veya İndirilen Video Yok</h3>
        <p style="color:var(--text-light)">Şu an çevrimdışısın ve bu kategoride cihaza indirilmiş video bulunmuyor.</p>
      </div>`;
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
    card.className = `video-card` + (isShort ? ' short-card' : '') + (isDisabled ? ' offline-disabled' : '');
    card.id        = `video-card-` + video.id;

    // Çevrimdışı katmanı
    const offlineOverlay = isDisabled ? `
      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.88);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:inherit;gap:6px;">
        <span style="font-size:32px">😴</span>
        <span style="font-weight:700;font-size:12px;color:#374151">İnternet Gerekli</span>
      </div>` : '';

    // Short rozeti
    const shortTag = isShort
      ? `<span style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:3px 9px;border-radius:20px;z-index:15;box-shadow:0 2px 8px rgba(255,107,107,0.5);letter-spacing:0.5px;">⚡ SHORT</span>`
      : '';

    // Kategori rozeti
    const catTag = `<span class="video-badge" style="` + (isYT ? 'background:rgba(220,38,38,0.88)' : 'background:rgba(21,128,61,0.9)') + `">` + (video.badge || '') + `</span>`;

    // İndirme / YT simgesi
    const dlTag = isYT
      ? `<span style="position:absolute;bottom:8px;right:8px;background:rgba(220,38,38,0.88);color:#fff;font-size:9px;font-weight:800;padding:3px 8px;border-radius:10px;z-index:15;">▶ YT</span>`
      : `<button id="dl-btn-` + video.id + `" title="` + (isDownloaded ? 'Cihazda Kayıtlı' : 'Çevrimdışı İndir') + `"
                 style="position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                 ` + (isDownloaded ? '📥' : '💾') + `
         </button>`;

    // Favori butonu
    const favTag = `
      <button class="fav-btn" style="position:absolute;bottom:8px;left:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);margin-bottom:0;">
        ` + (isFav ? '⭐' : '☆') + `
      </button>`;

    card.innerHTML = `
      ` + offlineOverlay + `
      <div class="video-thumbnail-container" style="position:relative;cursor:` + (isDisabled ? 'not-allowed' : 'pointer') + `;">
        ` + shortTag + `
        ` + catTag + `
        <img class="video-thumbnail" src="` + video.thumbnail + `" alt="` + video.title + `" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop'">
        <div class="play-overlay" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-size:30px;line-height:1">▶</span>
          <span style="font-size:10px;background:rgba(0,0,0,0.6);padding:2px 10px;border-radius:12px;color:#fff;">
            ` + (isMP4 ? '🎬 Hemen Oynat' : '▶ YouTube\'da İzle') + `
          </span>
        </div>
        ` + favTag + `
        ` + dlTag + `
      </div>
      <div class="video-info">
        <h3 class="video-title">` + video.title + `</h3>
        <p class="video-desc">` + video.desc + `</p>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <span class="video-category">
            ` + (video.category === 'cartoons' ? '🐱 Çizgi Film' : video.category === 'songs' ? '🎵 Şarkı' : '🧠 Eğitici') + `
          </span>
          ` + (isShort ? '<span style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:12px;letter-spacing:0.3px;">⚡ SHORT</span>' : '') + `
          ` + (isMP4 ? '<span style="background:rgba(21,128,61,0.1);color:#15803d;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;border:1px solid rgba(21,128,61,0.2);">✅ MP4</span>' : '') + `
        </div>
      </div>`;

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
    card.querySelector(`#dl-btn-` + video.id)?.addEventListener('click', e => {
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
  currentPlayingVideoId = videoId;
  const video = VIDEO_DATABASE.find(v => v.id === videoId);
  if (!video) {
    console.error('[Video] ID bulunamadı:', videoId, '— DATABASE boyutu:', VIDEO_DATABASE.length);
    return;
  }

  const modal    = document.getElementById('player-modal');
  const mediaCon = document.getElementById('kids-media-container');
  const titleEl  = document.getElementById('player-title');
  if (!modal || !mediaCon) return;

  titleEl.textContent = `🎬 ` + video.title;
  
  if (video.youtubeId) {
    mediaCon.innerHTML = `
      <div style="position:relative;width:100%;height:100%;background:#000;">
        <iframe id="kids-youtube-iframe"
          src="https://www.youtube.com/embed/` + video.youtubeId + `?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="width:100%;height:100%;display:block;border:none;">
        </iframe>
      </div>
      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="color:#6B7280;font-size:11px;">❤️ Güvenli Çocuk YouTube Modu</span>
        <a href="https://www.youtube.com/watch?v=` + video.youtubeId + `" target="_blank"
           style="padding:5px 14px;background:#DC2626;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">
          ▶ YouTube'da Aç ↗
        </a>
      </div>`;
  } else {
    mediaCon.innerHTML  = `
      <video id="kids-video-player"
        controls autoplay playsinline
        style="width:100%;max-height:65vh;background:#000;display:block;border-radius:0;">
        <source src="` + video.url + `" type="video/mp4">
        <p style="color:#fff;padding:20px;text-align:center;">
          Video oynatılamadı. 
          <a href="` + video.url + `" target="_blank" style="color:#FCD34D;">Doğrudan aç ↗</a>
        </p>
      </video>
      <div style="background:#111827;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="color:#6B7280;font-size:11px;">✅ Doğrudan MP4 oynatılıyor — Çevrimdışı indirilebilir</span>
        <a href="` + video.url + `" target="_blank" download
           style="padding:5px 14px;background:#059669;color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">
          📥 İndir
        </a>
      </div>`;
  }

  const vEl = mediaCon.querySelector('#kids-video-player');
  vEl?.addEventListener('error', () => {
    mediaCon.innerHTML = `
      <div style="background:#111827;padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;">
        <span style="font-size:44px">😔</span>
        <p style="color:#9CA3AF">Video yüklenemedi.</p>
        <a href="` + video.url + `" target="_blank"
           style="padding:12px 28px;background:#059669;color:#fff;border-radius:50px;font-weight:700;text-decoration:none;">
          🔗 Doğrudan Aç
        </a>
      </div>`;
  });

  modal.classList.add('active');
}

// ─────────────────────────────────────────────────────────
// PLAYER KAPAT
// ─────────────────────────────────────────────────────────
function closeVideoPlayer() {
  currentPlayingVideoId = null;
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

  const btn  = document.getElementById(`dl-btn-` + video.id);
  const dIds = await getDownloadedIds();
  const isDl = dIds.includes(video.url);

  if (isDl) {
    if (!confirm(`"` + video.title + `" çevrimdışı hafızadan silinsin mi?`)) return;
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
    const btn = document.getElementById(`dl-btn-` + v.id);
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

function renderVideos(category) {
  currentCategory     = category || 'all';
  currentFilteredList = [...VIDEO_DATABASE];
  applyAndRender();
}

// ─────────────────────────────────────────────────────────
// SWIPE INTERACTION HELPERS (TikTok / Shorts Style)
// ─────────────────────────────────────────────────────────
function processSwipe(startX, startY, endX, endY) {
  if (!currentPlayingVideoId) return;

  const video = VIDEO_DATABASE.find(v => v.id === currentPlayingVideoId);
  if (!video) return;

  // Swiping is active for Short videos or when in the Shorts category tab
  const isShort = video.duration === 'short' || currentCategory === 'shorts';
  if (!isShort) return;

  const deltaY = endY - startY;
  const deltaX = endX - startX;
  const threshold = 60; // minimum pixels for swipe

  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    if (Math.abs(deltaY) > threshold) {
      if (deltaY < 0) {
        // Swiped UP -> Play next video
        console.log('[Swipe] Swiped UP - Playing next story');
        playNextVideo(currentPlayingVideoId, 1);
      } else {
        // Swiped DOWN -> Play previous video
        console.log('[Swipe] Swiped DOWN - Playing previous story');
        playNextVideo(currentPlayingVideoId, -1);
      }
    }
  } else {
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        // Swiped LEFT -> Play next video
        console.log('[Swipe] Swiped LEFT - Playing next story');
        playNextVideo(currentPlayingVideoId, 1);
      } else {
        // Swiped RIGHT -> Play previous video
        console.log('[Swipe] Swiped RIGHT - Playing previous story');
        playNextVideo(currentPlayingVideoId, -1);
      }
    }
  }
}

function playNextVideo(currentId, direction = 1) {
  const list = currentCategory === 'shorts'
    ? currentFilteredList.filter(v => v.duration === 'short')
    : currentFilteredList;

  if (list.length <= 1) return;

  const currentIndex = list.findIndex(v => v.id === currentId);
  if (currentIndex === -1) return;

  let nextIndex = currentIndex + direction;
  if (nextIndex >= list.length) {
    nextIndex = 0; // wrap around
  } else if (nextIndex < 0) {
    nextIndex = list.length - 1; // wrap around
  }

  const nextVideo = list[nextIndex];

  // Visual user hint
  const hintText = direction === 1 ? "Sonraki Hikaye" : "Önceki Hikaye";
  const hintIcon = direction === 1 ? "👇" : "👆";
  showSwipeHint(hintText, hintIcon);

  // Smooth sliding transition animation
  const container = document.getElementById('kids-media-container');
  if (container) {
    container.style.transition = 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out';
    container.style.transform = direction === 1 ? 'translateY(-100px)' : 'translateY(100px)';
    container.style.opacity = '0.2';

    setTimeout(() => {
      playVideo(nextVideo.id);

      // Reset position instantly before sliding in
      container.style.transition = 'none';
      container.style.transform = direction === 1 ? 'translateY(100px)' : 'translateY(-100px)';

      // Trigger layout reflow
      container.offsetHeight;

      // Slide in from opposite direction
      container.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease-out';
      container.style.transform = 'translateY(0)';
      container.style.opacity = '1';
    }, 200);
  } else {
    playVideo(nextVideo.id);
  }
}

function showSwipeHint(text, icon) {
  let hint = document.getElementById('player-swipe-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'player-swipe-hint';
    hint.style.position = 'absolute';
    hint.style.top = '50%';
    hint.style.left = '50%';
    hint.style.transform = 'translate(-50%, -50%) scale(0.8)';
    hint.style.background = 'rgba(17, 24, 39, 0.95)';
    hint.style.color = '#fff';
    hint.style.padding = '18px 32px';
    hint.style.borderRadius = '35px';
    hint.style.display = 'flex';
    hint.style.flexDirection = 'column';
    hint.style.alignItems = 'center';
    hint.style.gap = '8px';
    hint.style.zIndex = '350';
    hint.style.pointerEvents = 'none';
    hint.style.fontFamily = 'var(--font-kids)';
    hint.style.fontWeight = '800';
    hint.style.fontSize = '16px';
    hint.style.opacity = '0';
    hint.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    hint.style.boxShadow = '0 12px 36px rgba(0,0,0,0.5)';
    hint.style.border = '4px solid var(--sun-yellow)';
    
    const modal = document.getElementById('player-modal');
    if (modal) modal.appendChild(hint);
  }

  hint.innerHTML = `<span style="font-size: 38px; display: inline-block; animation: kidsBounce 0.6s infinite alternate;">` + icon + `</span><span style="letter-spacing: 0.5px;">` + text + `</span>`;

  // Force reflow
  hint.offsetHeight;

  hint.style.opacity = '1';
  hint.style.transform = 'translate(-50%, -50%) scale(1)';

  setTimeout(() => {
    hint.style.opacity = '0';
    hint.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }, 1000);
}
