/**
 * KIDS FUN LAND - MAIN PWA APPLICATION CONTROLLER
 * Manages Service Worker lifecycle, reactive online/offline network checks,
 * screen switching (router), parental gate lock, screen-time restrictions,
 * and offline caching storage size calculations.
 */

// Application State
const STATE = {
  activeScreen: 'home',
  isOnline: navigator.onLine,
  timeLimitMinutes: 0,
  timeRemainingSeconds: 0,
  timerIntervalId: null,
  mathQuestion: { num1: 0, num2: 0, answer: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
  // PWA Cache Invalidator - forces browser to fully refresh and clear old cached assets once
  if (localStorage.getItem('kids_app_version') !== 'v17') {
    localStorage.setItem('kids_app_version', 'v17');
    if ('caches' in window) {
      caches.keys().then((names) => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).then(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            return Promise.all(registrations.map(r => r.unregister()));
          }).then(() => {
            window.location.reload(true);
          });
        } else {
          window.location.reload();
        }
      }).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
    return; // Stop initialization as the page is reloading
  }

  console.log('[App Engine] Initializing Kid Web App...');
  
  // Register Progressive Web App Service Worker
  registerServiceWorker();

  // Initialize Modules
  if (typeof initVideosModule === 'function') initVideosModule();
  if (typeof initGamesModule === 'function') initGamesModule();

  // Load Saved Settings from LocalStorage
  loadParentSettings();

  // Setup Event Listeners
  setupNavigation();
  setupParentGate();
  setupNetworkListeners();
  setupPWAInstallPrompt();

  // Initial UI Update
  updateNetworkUI(STATE.isOnline);
  updateCacheUsageStats();
});

// PWA Install Prompt
let deferredPrompt;
function setupPWAInstallPrompt() {
  const installBtn = document.getElementById('btn-install-pwa');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
    console.log('[PWA] beforeinstallprompt event fired. Showing install button.');
  });

  installBtn.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User install prompt outcome: ${outcome}`);
      deferredPrompt = null;
    }
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
    console.log('[PWA] App successfully installed to home screen!');
  });
}

// PWA Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((reg) => {
          console.log('[Service Worker] Registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('[Service Worker] Registration failed:', err);
        });
    });
  }
}

// ----------------------------------------------------
// ROUTING & NAVIGATION
// ----------------------------------------------------
function setupNavigation() {
  // Logo acts as home button
  document.getElementById('btn-logo').addEventListener('click', () => switchScreen('home'));

  // Nav buttons
  document.getElementById('nav-videos-btn').addEventListener('click', () => switchScreen('videos'));
  document.getElementById('nav-games-btn').addEventListener('click', () => switchScreen('games'));
  
  // Parent Corner goes through the gate lock first
  document.getElementById('nav-parent-btn').addEventListener('click', () => {
    openParentGateModal();
  });

  // Home Screen choices
  document.getElementById('home-choice-videos').addEventListener('click', () => switchScreen('videos'));
  document.getElementById('home-choice-games').addEventListener('click', () => switchScreen('games'));
}

function switchScreen(screenId) {
  console.log(`[Router] Switching to screen: ${screenId}`);
  
  // Pause any video playback if switching away from videos
  if (STATE.activeScreen === 'videos' && screenId !== 'videos') {
    if (typeof closeVideoPlayer === 'function') closeVideoPlayer();
  }

  // Deactivate current active games if switching away from games
  if (STATE.activeScreen === 'games' && screenId !== 'games') {
    if (typeof closeKidsGameAndReturn === 'function') closeKidsGameAndReturn();
  }

  // Handle active states on navigation tabs
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  if (screenId === 'videos') {
    document.getElementById('nav-videos-btn').classList.add('active');
  } else if (screenId === 'games') {
    document.getElementById('nav-games-btn').classList.add('active');
  } else if (screenId === 'parent') {
    document.getElementById('nav-parent-btn').classList.add('active');
  }

  // Toggle active class on screen containers
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
    if (screen.id === `screen-${screenId}`) {
      screen.classList.add('active');
    }
  });

  STATE.activeScreen = screenId;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Cache stats specifically when visiting parent screen
  if (screenId === 'parent') {
    updateCacheUsageStats();
  }
}

// ----------------------------------------------------
// PARENTAL MATH LOCK GATE
// ----------------------------------------------------
function openParentGateModal() {
  const modal = document.getElementById('parent-gate-modal');
  const questionEl = document.getElementById('gate-question');
  const inputEl = document.getElementById('gate-answer');
  
  // Generate random sum (numbers between 5 and 15)
  const num1 = Math.floor(Math.random() * 11) + 5;
  const num2 = Math.floor(Math.random() * 11) + 5;
  const answer = num1 + num2;
  
  STATE.mathQuestion = { num1, num2, answer };
  
  questionEl.textContent = `${num1} + ${num2} = ?`;
  inputEl.value = '';
  modal.classList.add('active');
  
  // Auto focus input
  setTimeout(() => inputEl.focus(), 150);
}

function setupParentGate() {
  const modal = document.getElementById('parent-gate-modal');
  const inputEl = document.getElementById('gate-answer');
  
  document.getElementById('btn-gate-cancel').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById('btn-gate-submit').addEventListener('click', checkParentGateAnswer);

  inputEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      checkParentGateAnswer();
    }
  });
}

function checkParentGateAnswer() {
  const modal = document.getElementById('parent-gate-modal');
  const userAnswer = parseInt(document.getElementById('gate-answer').value, 10);
  
  if (userAnswer === STATE.mathQuestion.answer) {
    console.log('[Parent Gate] Correct answer. Access granted.');
    modal.classList.remove('active');
    switchScreen('parent');
  } else {
    alert('❌ Yanlış cevap! Bu bölüme sadece ebeveynler erişebilir.');
    modal.classList.remove('active');
  }
}

// ----------------------------------------------------
// NETWORK REACTIVE LISTENER
// ----------------------------------------------------
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    console.log('[Network] Connected online. Crawling background Agent...');
    STATE.isOnline = true;
    updateNetworkUI(true);
    // Refresh catalog using background Agent crawl
    if (typeof loadAgentVideos === 'function') {
      loadAgentVideos();
    } else if (typeof renderVideos === 'function') {
      renderVideos(window.currentActiveCategory || 'all');
    }
  });

  window.addEventListener('offline', () => {
    console.log('[Network] Connection lost. Offline mode active.');
    STATE.isOnline = false;
    updateNetworkUI(false);
    // Refresh video library to disable non-cached videos
    if (typeof renderVideos === 'function') renderVideos(window.currentActiveCategory || 'all');
  });
}

function updateNetworkUI(isOnline) {
  const container = document.getElementById('connection-status');
  const avatar = document.getElementById('mascot-avatar');
  const text = document.getElementById('connection-text');

  if (isOnline) {
    container.className = 'status-mascot-container online';
    avatar.textContent = '☀️';
    text.textContent = 'İnternetimiz Açık!';
  } else {
    container.className = 'status-mascot-container offline';
    avatar.textContent = '😴☁️';
    text.textContent = 'İnternetimiz Uyuyor...';
  }
}

// ----------------------------------------------------
// SCREEN TIME LIMIT CONTROLS
// ----------------------------------------------------
function loadParentSettings() {
  // Screen time limit select
  const select = document.getElementById('time-limit-select');
  const savedLimit = localStorage.getItem('kids_screen_time_limit');
  
  if (savedLimit) {
    select.value = savedLimit;
    STATE.timeLimitMinutes = parseInt(savedLimit, 10);
    if (STATE.timeLimitMinutes > 0) {
      startScreenTimer(STATE.timeLimitMinutes);
    }
  }

  select.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10);
    localStorage.setItem('kids_screen_time_limit', value);
    STATE.timeLimitMinutes = value;
    
    if (value > 0) {
      startScreenTimer(value);
    } else {
      stopScreenTimer();
    }
  });

  // Locked overlay "OK" button (locks the screen again unless parent unlocks it)
  document.getElementById('btn-close-sleep').addEventListener('click', () => {
    // Requires solving math equation to close sleeping screen!
    const num1 = Math.floor(Math.random() * 8) + 4;
    const num2 = Math.floor(Math.random() * 8) + 4;
    const ans = num1 + num2;
    
    const gateInput = prompt(`Kilidi açmak için lütfen bu işlemi çözün:\n${num1} + ${num2} = ?`);
    if (parseInt(gateInput, 10) === ans) {
      document.getElementById('time-limit-screen').classList.remove('active');
      // Reset limit to unlimited on unlock, so they can access the settings to change it
      document.getElementById('time-limit-select').value = '0';
      localStorage.setItem('kids_screen_time_limit', 0);
      stopScreenTimer();
    }
  });
}

function startScreenTimer(minutes) {
  stopScreenTimer(); // Clear existing timers
  
  STATE.timeRemainingSeconds = minutes * 60;
  
  const timerDisplay = document.getElementById('active-timer-display');
  const timeRemainingText = document.getElementById('time-remaining');
  
  timerDisplay.style.display = 'flex';
  
  // Initial update
  updateTimerUI();

  STATE.timerIntervalId = setInterval(() => {
    STATE.timeRemainingSeconds--;
    updateTimerUI();

    if (STATE.timeRemainingSeconds <= 0) {
      triggerTimeLimitReached();
    }
  }, 1000);
}

function stopScreenTimer() {
  if (STATE.timerIntervalId) {
    clearInterval(STATE.timerIntervalId);
    STATE.timerIntervalId = null;
  }
  document.getElementById('active-timer-display').style.display = 'none';
}

function updateTimerUI() {
  const m = Math.floor(STATE.timeRemainingSeconds / 60);
  const s = STATE.timeRemainingSeconds % 60;
  const timeText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  document.getElementById('time-remaining').textContent = timeText;
}

function triggerTimeLimitReached() {
  stopScreenTimer();
  
  // Pause any playing videos or games
  if (typeof closeVideoPlayer === 'function') closeVideoPlayer();
  if (typeof closeKidsGameAndReturn === 'function') closeKidsGameAndReturn();
  
  // Activate locked sleep screen overlay
  document.getElementById('time-limit-screen').classList.add('active');
}

// ----------------------------------------------------
// CACHE SPACE CALCULATION STATS
// ----------------------------------------------------
async function updateCacheUsageStats() {
  const staticSizeEl = document.getElementById('cache-static-size');
  const videoSizeEl = document.getElementById('cache-video-size');
  
  if (!staticSizeEl || !videoSizeEl) return;

  try {
    const staticSize = await calculateCacheSize('cocuk-dunyasi-v4');
    const videoSize = await calculateCacheSize('cocuk-dunyasi-videos-v4');
    
    staticSizeEl.textContent = formatBytes(staticSize);
    videoSizeEl.textContent = formatBytes(videoSize);
  } catch (err) {
    console.error('[Cache Stats] Error reading sizes:', err);
    staticSizeEl.textContent = 'Bilinmiyor';
    videoSizeEl.textContent = 'Bilinmiyor';
  }
}

async function calculateCacheSize(cacheName) {
  if (!('caches' in window)) return 0;
  
  let size = 0;
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const req of requests) {
      const response = await cache.match(req);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }
  } catch (e) {
    console.warn(`Calculated size failed for cache: ${cacheName}`, e);
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

// Delete and Wipe Cache operations
document.getElementById('btn-clear-caches').addEventListener('click', async () => {
  const confirmWipe = confirm('⚠️ Tüm önbelleğe alınan videoları ve statik dosyaları silmek istediğinizden emin misiniz? Bu işlem, uygulamayı internet olmadığında çalışmaz hale getirecektir.');
  
  if (!confirmWipe) return;

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'VIDEO_CACHE_UPDATED',
          action: 'clear'
        });
      }
      alert('🗑 Cihaz hafızası başarıyla boşaltıldı!');
      
      // Update sizes and reload catalog to reflect new state
      updateCacheUsageStats();
      if (typeof updateAllDownloadStatuses === 'function') updateAllDownloadStatuses();
      renderVideos(window.currentActiveCategory || 'all');
    }
  } catch (e) {
    console.error('Clearing caches failed:', e);
    alert('Hata: Önbellek silinemedi.');
  }
});
