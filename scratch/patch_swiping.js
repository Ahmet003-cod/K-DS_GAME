const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web\\videos.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add currentPlayingVideoId definition at global variables
const targetVar = 'let ytAPIReady         = false;';
const replacementVar = 'let ytAPIReady         = false;\nlet currentPlayingVideoId = null;';

if (content.includes(targetVar)) {
  content = content.replace(targetVar, replacementVar);
  console.log('1. Added currentPlayingVideoId global variable.');
} else {
  console.error('Could not find target global variable definition.');
}

// 2. Set currentPlayingVideoId inside playVideo(videoId)
const targetPlay = 'function playVideo(videoId) {';
const replacementPlay = 'function playVideo(videoId) {\n  currentPlayingVideoId = videoId;';

if (content.includes(targetPlay)) {
  content = content.replace(targetPlay, replacementPlay);
  console.log('2. Set currentPlayingVideoId inside playVideo.');
} else {
  console.error('Could not find function playVideo definition.');
}

// 3. Add gestures setup in initVideosModule() right before closing brace
const targetInitEnd = '  updateDownloadStatuses();\n}';
const replacementInitEnd = `  updateDownloadStatuses();

  // ── SWIPE GESTURES FOR STORIES (SHORTS) ──
  (function setupSwipeGestures() {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchEndY = 0;
    let touchEndX = 0;
    let isSwiping = false;

    const modal = document.getElementById('player-modal');
    if (!modal) return;

    // Mobile touch gestures
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

    // Desktop mouse gestures for testing!
    let isMouseDown = false;
    modal.addEventListener('mousedown', e => {
      // Don't trigger if clicking interactive elements
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
    
    // Inject dynamic swipe styles (bounce keyframes)
    if (!document.getElementById('kids-swipe-styles')) {
      const style = document.createElement('style');
      style.id = 'kids-swipe-styles';
      style.textContent = \`
        @keyframes kidsBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      \`;
      document.head.appendChild(style);
    }
  })();
}`;

if (content.includes(targetInitEnd)) {
  content = content.replace(targetInitEnd, replacementInitEnd);
  console.log('3. Added swipe gesture listeners inside initVideosModule.');
} else {
  console.error('Could not find end of initVideosModule.');
}

// 4. Add helper functions at the end of videos.js
const extraHelpers = `

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

  hint.innerHTML = \`<span style="font-size: 38px; display: inline-block; animation: kidsBounce 0.6s infinite alternate;">\x60 + icon + \x60</span><span style="letter-spacing: 0.5px;">\x60 + text + \x60</span>\`;

  // Force reflow
  hint.offsetHeight;

  hint.style.opacity = '1';
  hint.style.transform = 'translate(-50%, -50%) scale(1)';

  setTimeout(() => {
    hint.style.opacity = '0';
    hint.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }, 1000);
}
`;

content += extraHelpers;
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched videos.js with swiping capabilities!');
