/**
 * KIDS FUN LAND - GAMES ENGINE (OFFLINE CAPABLE)
 * Complete implementation of Balloon Popper (Canvas + synthesized Web Audio sounds),
 * Memory Match card game (sevingly animal themed), and Magic Paint drawing board.
 */

// Polyfill for CanvasRenderingContext2D.prototype.roundRect (for older browsers/Safari)
if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (!radii) radii = 0;
    if (typeof radii === 'number') radii = [radii];
    if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
    else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
    else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
    
    const r = {
      tl: radii[0] || 0,
      tr: radii[1] || 0,
      br: radii[2] || 0,
      bl: radii[3] || 0
    };
    
    this.moveTo(x + r.tl, y);
    this.lineTo(x + w - r.tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    this.lineTo(x + w, y + h - r.br);
    this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    this.lineTo(x + r.bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    this.lineTo(x, y + r.tl);
    this.quadraticCurveTo(x, y, x + r.tl, y);
    return this;
  };
}

// Web Audio Synth for Pop Sounds (100% offline, zero network assets needed!)
let audioCtx = null;
function playPopSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Make a cute, brief bubble "pop" frequency sweep
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.warn('AudioContext is not supported or was blocked by browser policy:', e);
  }
}

// Background MP3 Music logic
function startBackgroundMelody() {
  try {
    const bgMusic = document.getElementById('kids-bg-music');
    if (bgMusic) {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(e => console.warn('MP3 autoplay blocked:', e));
    }
  } catch(e) {
    console.warn("Background audio play failed", e);
  }
}

function stopBackgroundMelody() {
  try {
    const bgMusic = document.getElementById('kids-bg-music');
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  } catch(e) {
    console.warn("Background audio pause failed", e);
  }
}

// ----------------------------------------------------
// GAME 1: BALLOON POPPER (Canvas-based flying balloons)
// ----------------------------------------------------
let balloonGameInstance = null;

class BalloonPopper {
  constructor(canvasId, scoreId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    
    this.score = 0;
    this.balloons = [];
    this.particles = [];
    this.animationId = null;
    this.colors = ['#FF6B6B', '#4A90E2', '#B4F8C8', '#FFF3B0', '#FFAEBC', '#D6A2E8', '#FF9F43'];
    this.running = false;
    
    // Scale canvas resolution
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Event listener for popping balloons
    this.canvas.addEventListener('mousedown', (e) => this.handlePop(e));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handlePop(touch);
    }, { passive: false });
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 550;
    const h = rect.height || 412;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  start() {
    this.resizeCanvas();
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.balloons = [];
    this.particles = [];
    this.running = true;
    
    // Spawn initial balloons
    for (let i = 0; i < 5; i++) {
      this.spawnBalloon(true);
    }
    
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  spawnBalloon(randomY = false) {
    const radius = 30 + Math.random() * 20;
    const x = radius + Math.random() * (this.width - radius * 2);
    const y = randomY ? Math.random() * (this.height - 100) + 100 : this.height + radius + 20;
    const speed = 1.5 + Math.random() * 2;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const wobbleSpeed = 0.02 + Math.random() * 0.03;
    const wobbleRange = 10 + Math.random() * 15;
    
    this.balloons.push({
      x, y, radius, speed, color,
      angle: Math.random() * Math.PI,
      wobbleSpeed, wobbleRange,
      originX: x
    });
  }

  createBurst(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  handlePop(event) {
    if (!this.running) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      // Expand click box slightly for easier touch interaction for children
      const distance = Math.hypot(clickX - b.x, clickY - b.y);
      if (distance < b.radius + 15) {
        // Popped!
        playPopSound();
        this.createBurst(b.x, b.y, b.color);
        this.balloons.splice(i, 1);
        this.score += 10;
        this.scoreEl.textContent = this.score;
        this.spawnBalloon();
        break;
      }
    }
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw and Update Balloons
    this.balloons.forEach((b, index) => {
      // Float Up
      b.y -= b.speed;
      // Wobble Left and Right
      b.angle += b.wobbleSpeed;
      b.x = b.originX + Math.sin(b.angle) * b.wobbleRange;
      
      // Keep in canvas bounds x
      if (b.x < b.radius) b.x = b.radius;
      if (b.x > this.width - b.radius) b.x = this.width - b.radius;
      
      // Draw Balloon
      this.ctx.beginPath();
      // Draw balloon oval shape
      this.ctx.ellipse(b.x, b.y, b.radius * 0.85, b.radius, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = b.color;
      this.ctx.fill();
      
      // Add subtle glossy highlight
      this.ctx.beginPath();
      this.ctx.ellipse(b.x - b.radius * 0.3, b.y - b.radius * 0.4, b.radius * 0.2, b.radius * 0.3, Math.PI/4, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
      this.ctx.fill();

      // Draw bottom knot
      this.ctx.beginPath();
      this.ctx.moveTo(b.x - 6, b.y + b.radius);
      this.ctx.lineTo(b.x + 6, b.y + b.radius);
      this.ctx.lineTo(b.x, b.y + b.radius + 8);
      this.ctx.closePath();
      this.ctx.fillStyle = b.color;
      this.ctx.fill();
      
      // Draw string
      this.ctx.beginPath();
      this.ctx.moveTo(b.x, b.y + b.radius + 8);
      this.ctx.quadraticCurveTo(b.x - 5, b.y + b.radius + 25, b.x, b.y + b.radius + 40);
      this.ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Spawn new balloon if floats off-screen
      if (b.y < -b.radius) {
        this.balloons.splice(index, 1);
        this.spawnBalloon();
      }
    });
    
    // Draw and Update Particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
        return;
      }
      
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ----------------------------------------------------
// GAME 2: ANIMAL MEMORY MATCH
// ----------------------------------------------------
const MEMORY_ANIMALS = ['🐶', '🐱', '🦊', '🐻', '🦁', '🐯', '🐸', '🐵'];
let firstCard = null;
let secondCard = null;
let lockMemoryBoard = false;
let memoryMoves = 0;
let memoryScore = 0;

function initMemoryGame() {
  const board = document.getElementById('memory-board');
  if (!board) return;

  board.innerHTML = '';
  firstCard = null;
  secondCard = null;
  lockMemoryBoard = false;
  memoryMoves = 0;
  memoryScore = 0;
  
  document.getElementById('memory-moves').textContent = memoryMoves;
  document.getElementById('memory-score').textContent = `0/${MEMORY_ANIMALS.length}`;

  // Duplicate animal array to make matching pairs and shuffle
  const deck = [...MEMORY_ANIMALS, ...MEMORY_ANIMALS]
    .map((animal, index) => ({ animal, id: index }))
    .sort(() => Math.random() - 0.5);

  deck.forEach(cardData => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.animal = cardData.animal;
    
    card.innerHTML = `
      <div class="memory-card-face memory-card-front">❓</div>
      <div class="memory-card-face memory-card-back">${cardData.animal}</div>
    `;
    
    card.addEventListener('click', () => flipMemoryCard(card));
    board.appendChild(card);
  });
}

function flipMemoryCard(card) {
  if (lockMemoryBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains('matched') || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  playPopSound(); // play pop sound for card flips!

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  memoryMoves++;
  document.getElementById('memory-moves').textContent = memoryMoves;

  checkMemoryMatch();
}

function checkMemoryMatch() {
  const isMatch = firstCard.dataset.animal === secondCard.dataset.animal;
  
  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    memoryScore++;
    document.getElementById('memory-score').textContent = `${memoryScore}/${MEMORY_ANIMALS.length}`;
    
    // Add success particle flare or visual pop
    playPopSound();
    setTimeout(() => playPopSound(), 100); // double pop on success match!
    
    resetCards();
    
    // Win Condition
    if (memoryScore === MEMORY_ANIMALS.length) {
      setTimeout(() => {
        alert(`🌟 Tebrikler! Harika Hafızanla ${memoryMoves} hamlede tüm sevimli hayvan eşlerini buldun! 🎉`);
      }, 500);
    }
  } else {
    lockMemoryBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetCards();
    }, 1000);
  }
}

function resetCards() {
  [firstCard, secondCard] = [null, null];
  lockMemoryBoard = false;
}

// ----------------------------------------------------
// GAME 3: MAGIC PAINT (Sihirli Boyama)
// ----------------------------------------------------
let paintCanvas = null;
let paintCtx = null;
let isDrawing = false;
let drawColor = '#FF6B6B';
let brushSize = 8;
let drawMode = 'paint'; // or 'erase'

function initPaintGame() {
  paintCanvas = document.getElementById('paint-canvas');
  if (!paintCanvas) return;

  paintCtx = paintCanvas.getContext('2d');
  isDrawing = false;
  drawColor = '#FF6B6B';
  brushSize = 8;
  drawMode = 'paint';

  // Setup palette dots active class toggles
  const colorDots = document.querySelectorAll('.color-dot');
  colorDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      colorDots.forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
      drawColor = e.target.getAttribute('data-color');
      drawMode = 'paint';
      document.getElementById('btn-paint-eraser').classList.remove('active');
    });
  });

  // Scale Canvas
  resizePaintCanvas();
  window.addEventListener('resize', resizePaintCanvas);

  // Clear Board Button
  document.getElementById('btn-paint-clear').addEventListener('click', () => {
    paintCtx.fillStyle = '#FFFFFF';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    playPopSound();
  });

  // Eraser Button
  const eraserBtn = document.getElementById('btn-paint-eraser');
  eraserBtn.addEventListener('click', () => {
    drawMode = 'erase';
    colorDots.forEach(d => d.classList.remove('active'));
    eraserBtn.classList.add('active');
  });

  // Drawing event handlers
  paintCanvas.addEventListener('mousedown', startPaint);
  paintCanvas.addEventListener('mousemove', drawPaint);
  paintCanvas.addEventListener('mouseup', stopPaint);
  paintCanvas.addEventListener('mouseleave', stopPaint);

  // Touch Support
  paintCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = paintCanvas.getBoundingClientRect();
    startPaint({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: false });

  paintCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    drawPaint(touch);
  }, { passive: false });

  paintCanvas.addEventListener('touchend', stopPaint);
}

function resizePaintCanvas() {
  if (!paintCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = paintCanvas.getBoundingClientRect();
  
  // Save current canvas contents
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = paintCanvas.width || 550;
  tempCanvas.height = paintCanvas.height || 412;
  const tempCtx = tempCanvas.getContext('2d');
  try {
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      tempCtx.drawImage(paintCanvas, 0, 0);
    }
  } catch(e) {}

  const w = rect.width || 550;
  const h = rect.height || 412;
  paintCanvas.width = w * dpr;
  paintCanvas.height = h * dpr;
  paintCtx.scale(dpr, dpr);
  
  // Fill background white
  paintCtx.fillStyle = '#FFFFFF';
  paintCtx.fillRect(0, 0, w, h);
  
  // Restore canvas content
  try {
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      paintCtx.drawImage(tempCanvas, 0, 0, w, h);
    }
  } catch(e) {}
}

function startPaint(e) {
  isDrawing = true;
  paintCtx.beginPath();
  const rect = paintCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  paintCtx.moveTo(x, y);
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';
}

function drawPaint(e) {
  if (!isDrawing) return;
  
  const rect = paintCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  paintCtx.lineWidth = drawMode === 'erase' ? 24 : brushSize;
  paintCtx.strokeStyle = drawMode === 'erase' ? '#FFFFFF' : drawColor;
  
  paintCtx.lineTo(x, y);
  paintCtx.stroke();
}

function stopPaint() {
  isDrawing = false;
  paintCtx.closePath();
}

// ----------------------------------------------------
// GAME 4: SEVİMLİ KÖSTEBEK (Whack-a-Mole)
// ----------------------------------------------------
let moleGameInstance = null;

class WhackAMole {
  constructor(canvasId, scoreId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.score = 0;
    this.running = false;
    this.animationId = null;
    
    this.holes = [];
    this.moles = [];
    this.particles = [];
    
    this.resizeCanvas();
    this.initGrid();
    
    this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleClick(e.touches[0]);
    }, { passive: false });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 550;
    const h = rect.height || 412;
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  initGrid() {
    this.holes = [];
    this.moles = [];
    
    const cols = 3;
    const rows = 2;
    const cellW = this.width / cols;
    const cellH = this.height / rows;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = cellW * c + cellW / 2;
        const y = cellH * r + cellH / 2 + 20;
        this.holes.push({ x, y, radiusX: 55, radiusY: 22 });
        this.moles.push({
          x, y,
          state: 'down',
          progress: 0,
          emoji: '🐹',
          activeTime: 0,
          maxActiveTime: 1000 + Math.random() * 1200,
          speed: 0.04 + Math.random() * 0.03
        });
      }
    }
  }

  start() {
    this.resizeCanvas();
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.running = true;
    this.particles = [];
    this.initGrid();
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  handleClick(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    this.moles.forEach(m => {
      if (m.state === 'up' || m.state === 'rising') {
        const moleY = m.y - m.progress * 45;
        const dist = Math.hypot(clickX - m.x, clickY - moleY);
        if (dist < 45) {
          playPopSound();
          setTimeout(() => playPopSound(), 80);
          this.score += 10;
          this.scoreEl.textContent = this.score;
          m.state = 'hiding';
          m.speed = 0.12;
          m.emoji = '💥';
          
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: m.x, y: moleY - 10,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6 - 2,
              radius: 4 + Math.random() * 4,
              color: ['#FFF3B0', '#FFF', '#FFAEBC', '#B4F8C8'][Math.floor(Math.random() * 4)],
              alpha: 1,
              decay: 0.04
            });
          }
        }
      }
    });
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#E0F2FE';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#86EFAC';
    this.ctx.beginPath();
    this.ctx.ellipse(this.width/2, this.height, this.width, this.height/2, 0, 0, Math.PI*2);
    this.ctx.fill();
    
    this.moles.forEach((m, idx) => {
      const hole = this.holes[idx];
      
      if (m.state === 'down') {
        if (Math.random() < 0.008) {
          m.state = 'rising';
          m.emoji = ['🐹', '🐰', '🦊', '🐨'][Math.floor(Math.random() * 4)];
          m.progress = 0;
          m.activeTime = 0;
          m.maxActiveTime = 800 + Math.random() * 1000;
          m.speed = 0.04 + Math.random() * 0.03;
        }
      } else if (m.state === 'rising') {
        m.progress += m.speed;
        if (m.progress >= 1) {
          m.progress = 1;
          m.state = 'up';
        }
      } else if (m.state === 'up') {
        m.activeTime += 16.7;
        if (m.activeTime >= m.maxActiveTime) {
          m.state = 'hiding';
          m.speed = 0.05;
        }
      } else if (m.state === 'hiding') {
        m.progress -= m.speed;
        if (m.progress <= 0) {
          m.progress = 0;
          m.state = 'down';
        }
      }

      this.ctx.beginPath();
      this.ctx.ellipse(hole.x, hole.y, hole.radiusX, hole.radiusY, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = '#4B5563';
      this.ctx.fill();
      this.ctx.strokeStyle = '#1F2937';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(hole.x - hole.radiusX - 10, hole.y - 120, hole.radiusX * 2 + 20, 120);
      this.ctx.clip();
      
      const moleY = hole.y + 12 - m.progress * 42;
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText(m.emoji, hole.x, moleY);
      
      this.ctx.restore();

      this.ctx.beginPath();
      this.ctx.ellipse(hole.x, hole.y, hole.radiusX, hole.radiusY, 0, 0, Math.PI);
      this.ctx.strokeStyle = '#374151';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    });

    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(idx, 1);
        return;
      }
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.restore();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ----------------------------------------------------
// GAME 5: UÇAN ÇİKO (Flappy Bird style)
// ----------------------------------------------------
let flappyGameInstance = null;

class FlappyChiko {
  constructor(canvasId, scoreId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.score = 0;
    this.running = false;
    this.animationId = null;
    
    this.chiko = { x: 80, y: 150, radius: 20, velocity: 0, gravity: 0.45, jump: -6.5 };
    this.clouds = [];
    this.gameOver = false;
    this.frameCount = 0;
    
    this.resizeCanvas();
    
    const triggerJump = () => {
      if (this.gameOver) {
        this.reset();
      } else if (this.running) {
        this.chiko.velocity = this.chiko.jump;
        playPopSound();
      }
    };
    
    this.canvas.addEventListener('mousedown', triggerJump);
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerJump();
    }, { passive: false });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 550;
    const h = rect.height || 412;
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  start() {
    this.resizeCanvas();
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.running = true;
    this.gameOver = false;
    this.chiko.y = 150;
    this.chiko.velocity = 0;
    this.clouds = [];
    this.frameCount = 0;
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  reset() {
    this.start();
  }

  spawnCloud() {
    const gap = 125;
    const minHeight = 50;
    const maxHeight = this.height - gap - minHeight;
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
    
    this.clouds.push({
      x: this.width + 60,
      topHeight,
      bottomY: topHeight + gap,
      width: 50,
      passed: false
    });
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#BAE6FD';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.beginPath();
    this.ctx.arc(this.width - 60, 60, 35, 0, Math.PI*2);
    this.ctx.fillStyle = '#FEF08A';
    this.ctx.fill();
    
    this.frameCount++;
    
    if (!this.gameOver) {
      if (this.frameCount % 110 === 0) {
        this.spawnCloud();
      }
      
      this.chiko.velocity += this.chiko.gravity;
      this.chiko.y += this.chiko.velocity;
      
      if (this.chiko.y < this.chiko.radius) {
        this.chiko.y = this.chiko.radius;
        this.chiko.velocity = 0;
      }
      if (this.chiko.y > this.height - this.chiko.radius - 20) {
        this.triggerGameOver();
      }
    }

    this.clouds.forEach((cloud, idx) => {
      if (!this.gameOver) {
        cloud.x -= 2.2;
      }
      
      this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
      this.ctx.beginPath();
      this.ctx.roundRect(cloud.x, 0, cloud.width, cloud.topHeight, [0, 0, 16, 16]);
      this.ctx.fill();
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText('☁️', cloud.x + 10, cloud.topHeight);

      this.ctx.beginPath();
      this.ctx.roundRect(cloud.x, cloud.bottomY, cloud.width, this.height - cloud.bottomY, [16, 16, 0, 0]);
      this.ctx.fill();
      
      this.ctx.fillText('☁️', cloud.x + 10, cloud.bottomY + 22);
      
      if (!this.gameOver) {
        const cx = this.chiko.x;
        const cy = this.chiko.y;
        const r = this.chiko.radius;
        
        if (cx + r > cloud.x && cx - r < cloud.x + cloud.width) {
          if (cy - r < cloud.topHeight || cy + r > cloud.bottomY) {
            this.triggerGameOver();
          }
        }
        
        if (!cloud.passed && cloud.x + cloud.width < cx) {
          cloud.passed = true;
          this.score++;
          this.scoreEl.textContent = this.score;
          playPopSound();
          setTimeout(() => playPopSound(), 100);
        }
      }
      
      if (cloud.x < -100) {
        this.clouds.splice(idx, 1);
      }
    });

    this.ctx.fillStyle = '#4ADE80';
    this.ctx.fillRect(0, this.height - 20, this.width, 20);

    this.ctx.save();
    this.ctx.translate(this.chiko.x, this.chiko.y);
    const angle = Math.min(Math.max(this.chiko.velocity * 0.06, -0.4), 0.7);
    this.ctx.rotate(angle);
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐶', 0, 0);
    this.ctx.restore();

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.45)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 28px Fredoka, Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = 10;
      this.ctx.fillText('💥 Çiko Düştü!', this.width/2, this.height/2 - 25);
      
      this.ctx.font = '20px Fredoka, Arial';
      this.ctx.fillText(`Skor: ${this.score} Bulut ☁️`, this.width/2, this.height/2 + 10);
      
      this.ctx.font = 'bold 16px Fredoka, Arial';
      this.ctx.fillStyle = '#FCD34D';
      this.ctx.fillText('Tekrar Oynamak İçin Tıkla 👆', this.width/2, this.height/2 + 50);
      
      this.ctx.shadowBlur = 0;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    playPopSound();
    setTimeout(() => playPopSound(), 150);
  }
}

// ----------------------------------------------------
// GAME 6: SİHİRLİ KSİLOFON (Magic Xylophone)
// ----------------------------------------------------
const NOTE_FREQS = {
  "C4": 261.63,
  "D4": 293.66,
  "E4": 329.63,
  "F4": 349.23,
  "G4": 392.00,
  "A4": 440.00,
  "B4": 493.88,
  "C5": 523.25
};

function playXyNote(note) {
  const freq = NOTE_FREQS[note];
  if (!freq) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Warm, ringing wooden-bell timbre using triangle wave
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Instant attack, exponential sweet bell decay
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.55);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.warn('[Xy Synth] AudioContext error:', e);
  }
}

let currentSongTimeoutIds = [];
let isSongPlaying = false;

function stopAutoplaySong() {
  currentSongTimeoutIds.forEach(id => clearTimeout(id));
  currentSongTimeoutIds = [];
  isSongPlaying = false;
  
  document.querySelectorAll('.xy-key').forEach(k => k.classList.remove('active'));
  
  const stopBtn = document.getElementById('btn-stop-song');
  if (stopBtn) stopBtn.style.display = 'none';
  
  document.querySelectorAll('.song-play-btn').forEach(btn => {
    if (!btn.classList.contains('stop-song')) {
      btn.style.display = 'inline-block';
      btn.classList.remove('playing');
    }
  });
}

function playAutoplaySong(songName) {
  stopAutoplaySong();
  isSongPlaying = true;

  const btnAnnem = document.getElementById('btn-play-song-annem');
  const btnBalik = document.getElementById('btn-play-song-balik');
  const btnStop = document.getElementById('btn-stop-song');

  if (btnStop) btnStop.style.display = 'inline-block';
  
  if (songName === 'annem') {
    if (btnAnnem) { btnAnnem.classList.add('playing'); btnAnnem.style.display = 'inline-block'; }
    if (btnBalik) btnBalik.style.display = 'none';
  } else {
    if (btnBalik) { btnBalik.classList.add('playing'); btnBalik.style.display = 'inline-block'; }
    if (btnAnnem) btnAnnem.style.display = 'none';
  }

  let notes = [];
  if (songName === 'annem') {
    notes = [
      { note: "C4", dur: 400 }, { note: "C4", dur: 400 }, { note: "G4", dur: 400 }, { note: "G4", dur: 400 },
      { note: "A4", dur: 400 }, { note: "A4", dur: 400 }, { note: "G4", dur: 800 },
      { note: "F4", dur: 400 }, { note: "F4", dur: 400 }, { note: "E4", dur: 400 }, { note: "E4", dur: 400 },
      { note: "D4", dur: 400 }, { note: "D4", dur: 400 }, { note: "C4", dur: 800 },
      { note: "G4", dur: 400 }, { note: "G4", dur: 400 }, { note: "F4", dur: 400 }, { note: "F4", dur: 400 },
      { note: "E4", dur: 400 }, { note: "E4", dur: 400 }, { note: "D4", dur: 800 },
      { note: "G4", dur: 400 }, { note: "G4", dur: 400 }, { note: "F4", dur: 400 }, { note: "F4", dur: 400 },
      { note: "E4", dur: 400 }, { note: "E4", dur: 400 }, { note: "D4", dur: 800 },
      { note: "C4", dur: 400 }, { note: "C4", dur: 400 }, { note: "G4", dur: 400 }, { note: "G4", dur: 400 },
      { note: "A4", dur: 400 }, { note: "A4", dur: 400 }, { note: "G4", dur: 800 },
      { note: "F4", dur: 400 }, { note: "F4", dur: 400 }, { note: "E4", dur: 400 }, { note: "E4", dur: 400 },
      { note: "D4", dur: 400 }, { note: "D4", dur: 400 }, { note: "C4", dur: 800 }
    ];
  } else {
    notes = [
      { note: "C4", dur: 350 }, { note: "D4", dur: 350 }, { note: "E4", dur: 350 }, { note: "E4", dur: 350 }, { note: "E4", dur: 350 },
      { note: "D4", dur: 350 }, { note: "C4", dur: 350 }, { note: "D4", dur: 350 }, { note: "E4", dur: 350 }, { note: "E4", dur: 350 }, { note: "E4", dur: 700 },
      { note: "E4", dur: 350 }, { note: "F4", dur: 350 }, { note: "G4", dur: 350 }, { note: "G4", dur: 350 }, { note: "G4", dur: 350 },
      { note: "F4", dur: 350 }, { note: "E4", dur: 350 }, { note: "F4", dur: 350 }, { note: "G4", dur: 350 }, { note: "G4", dur: 350 }, { note: "G4", dur: 700 },
      { note: "C5", dur: 400 }, { note: "B4", dur: 400 }, { note: "A4", dur: 400 }, { note: "G4", dur: 800 },
      { note: "C5", dur: 400 }, { note: "B4", dur: 400 }, { note: "A4", dur: 400 }, { note: "G4", dur: 800 },
      { note: "F4", dur: 350 }, { note: "F4", dur: 350 }, { note: "E4", dur: 350 }, { note: "E4", dur: 350 },
      { note: "D4", dur: 350 }, { note: "D4", dur: 350 }, { note: "C4", dur: 800 }
    ];
  }

  let totalDelay = 0;
  notes.forEach((item, index) => {
    const tid = setTimeout(() => {
      const keyEl = document.querySelector(`.xy-key[data-note="${item.note}"]`);
      if (keyEl) {
        keyEl.classList.add('active');
        setTimeout(() => keyEl.classList.remove('active'), item.dur - 50);
      }
      playXyNote(item.note);

      if (index === notes.length - 1) {
        setTimeout(stopAutoplaySong, item.dur);
      }
    }, totalDelay);
    currentSongTimeoutIds.push(tid);
    totalDelay += item.dur;
  });
}

// ----------------------------------------------------
// GAME 7: MEYVE YAKALAMA MACERASI (Canvas-based game)
// ----------------------------------------------------
let catcherGameInstance = null;

class FruitCatcher {
  constructor(canvasId, scoreId, livesId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.livesEl = document.getElementById(livesId);
    
    this.score = 0;
    this.lives = 3;
    this.running = false;
    this.animationId = null;
    this.gameOver = false;
    
    this.basket = {
      x: 0,
      y: 0,
      width: 85,
      height: 48,
    };
    
    this.fruits = [];
    this.bombs = [];
    this.particles = [];
    this.fruitEmojis = ['🍓', '🍌', '🍇', '🍎', '🍉', '🍍'];
    
    this.frameCount = 0;
    this.spawnRate = 45;
    this.baseSpeed = 2.4;
    this.speedMultiplier = 1.0;
    
    this.resizeCanvas();
    this.basket.x = this.width / 2 - this.basket.width / 2;
    this.basket.y = this.height - 65;
    
    this.setupListeners();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 550;
    const h = rect.height || 412;
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  setupListeners() {
    const moveBasket = (clientX) => {
      if (!this.running || this.gameOver) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      this.basket.x = x - this.basket.width / 2;
      
      if (this.basket.x < 0) this.basket.x = 0;
      if (this.basket.x > this.width - this.basket.width) {
        this.basket.x = this.width - this.basket.width;
      }
    };

    this.canvas.addEventListener('mousemove', (e) => {
      moveBasket(e.clientX);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      moveBasket(e.touches[0].clientX);
    }, { passive: false });

    // Restart tap logic
    const handleTap = () => {
      if (this.gameOver) this.start();
    };
    this.canvas.addEventListener('mousedown', handleTap);
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.gameOver) {
        e.preventDefault();
        handleTap();
      }
    });
  }

  start() {
    this.resizeCanvas();
    this.basket.x = this.width / 2 - this.basket.width / 2;
    this.basket.y = this.height - 65;

    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.running = true;
    this.fruits = [];
    this.bombs = [];
    this.particles = [];
    this.speedMultiplier = 1.0;
    this.spawnRate = 45;
    this.frameCount = 0;
    
    this.scoreEl.textContent = this.score;
    this.updateLivesUI();
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  updateLivesUI() {
    let hearts = '';
    for (let i = 0; i < this.lives; i++) hearts += '❤️';
    for (let i = this.lives; i < 3; i++) hearts += '🖤';
    this.livesEl.textContent = hearts;
  }

  spawnItem() {
    const x = 30 + Math.random() * (this.width - 60);
    const y = -35;
    const speed = (this.baseSpeed + Math.random() * 2) * this.speedMultiplier;
    
    if (Math.random() < 0.84) {
      const emoji = this.fruitEmojis[Math.floor(Math.random() * this.fruitEmojis.length)];
      this.fruits.push({ x, y, speed, emoji, rotation: Math.random() * Math.PI });
    } else {
      this.bombs.push({ x, y, speed, rotation: 0, rotSpeed: 0.04 + Math.random() * 0.05 });
    }
  }

  createBurst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2.5,
        radius: 2.5 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    playPopSound();
    setTimeout(() => playPopSound(), 100);
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#E0F2FE');
    skyGrad.addColorStop(1, '#BAE6FD');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.frameCount++;
    
    if (!this.gameOver && this.frameCount % this.spawnRate === 0) {
      this.spawnItem();
    }
    
    if (!this.gameOver && this.frameCount % 500 === 0) {
      this.speedMultiplier += 0.14;
      if (this.spawnRate > 20) this.spawnRate -= 3;
    }
    
    // Draw Basket (Dog Theme!)
    const bx = this.basket.x;
    const by = this.basket.y;
    const bw = this.basket.width;
    const bh = this.basket.height;
    
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.ellipse(bx + bw/2, by + bh, bw/2, 6, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.08)';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, bw, bh, [10, 10, 24, 24]);
    this.ctx.fillStyle = '#FFAEBC';
    this.ctx.fill();
    this.ctx.strokeStyle = '#F87171';
    this.ctx.lineWidth = 3.5;
    this.ctx.stroke();

    // Basket internal curve
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 15, by + 12);
    this.ctx.quadraticCurveTo(bx + bw/2, by + 22, bx + bw - 15, by + 12);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // Puppy Face
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.beginPath();
    this.ctx.arc(bx + bw*0.3, by + bh*0.4, 4.5, 0, Math.PI*2);
    this.ctx.arc(bx + bw*0.7, by + bh*0.4, 4.5, 0, Math.PI*2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + bw/2, by + bh*0.6, 6, 4, 0, 0, Math.PI*2);
    this.ctx.fill();
    
    // Puppy Ears
    this.ctx.beginPath();
    this.ctx.ellipse(bx - 3, by + 14, 7, 16, Math.PI/12, 0, Math.PI*2);
    this.ctx.ellipse(bx + bw + 3, by + 14, 7, 16, -Math.PI/12, 0, Math.PI*2);
    this.ctx.fillStyle = '#D6A2E8';
    this.ctx.fill();

    this.ctx.restore();
    
    if (!this.gameOver) {
      // Fruits
      this.fruits.forEach((f, idx) => {
        f.y += f.speed;
        f.rotation += 0.015;
        
        this.ctx.save();
        this.ctx.translate(f.x, f.y);
        this.ctx.rotate(f.rotation);
        this.ctx.font = '34px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(f.emoji, 0, 0);
        this.ctx.restore();
        
        // Collsion check
        if (f.y + 12 >= by && f.y - 12 <= by + bh) {
          if (f.x + 12 >= bx && f.x - 12 <= bx + bw) {
            playPopSound();
            const colors = ['#FF6B6B', '#FCD34D', '#A78BFA', '#FCA5A5', '#86EFAC'];
            this.createBurst(f.x, f.y, colors[Math.floor(Math.random() * colors.length)]);
            this.fruits.splice(idx, 1);
            this.score += 10;
            this.scoreEl.textContent = this.score;
            return;
          }
        }
        
        if (f.y > this.height + 40) {
          this.fruits.splice(idx, 1);
        }
      });
      
      // Bombs
      this.bombs.forEach((b, idx) => {
        b.y += b.speed;
        b.rotation += b.rotSpeed;
        
        this.ctx.save();
        this.ctx.translate(b.x, b.y);
        this.ctx.rotate(b.rotation);
        this.ctx.font = '34px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💣', 0, 0);
        this.ctx.restore();
        
        if (b.y + 12 >= by && b.y - 12 <= by + bh) {
          if (b.x + 12 >= bx && b.x - 12 <= bx + bw) {
            playPopSound();
            setTimeout(() => playPopSound(), 80);
            this.createBurst(b.x, b.y, '#374151');
            
            this.bombs.splice(idx, 1);
            this.lives--;
            this.updateLivesUI();
            
            if (this.lives <= 0) {
              this.triggerGameOver();
            }
            return;
          }
        }
        
        if (b.y > this.height + 40) {
          this.bombs.splice(idx, 1);
        }
      });
    }
    
    // Particles
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(idx, 1);
        return;
      }
      
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
    
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 30px Fredoka, Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.fillText('🍎 Oyun Bitti!', this.width/2, this.height/2 - 30);
      
      this.ctx.font = '22px Fredoka, Arial';
      this.ctx.fillText(`Toplanan Puan: ${this.score}`, this.width/2, this.height/2 + 10);
      
      this.ctx.font = 'bold 15px Fredoka, Arial';
      this.ctx.fillStyle = '#FCD34D';
      this.ctx.fillText('Tekrar Oynamak İçin Ekrana Dokun! 👆', this.width/2, this.height/2 + 55);
      this.ctx.shadowBlur = 0;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ----------------------------------------------------
// MAIN ROUTER FOR GUEST ACTIVATIONS
// ----------------------------------------------------
// Helper functions to prevent script crashes on older browsers or cached HTML contexts
function safeActivateArena(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    return true;
  }
  return false;
}

function safeAddListener(id, event, callback) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener(event, callback);
  } else {
    console.warn(`[Safe Listener] Element not found: ${id}`);
  }
}

function selectKidsGame(gameId) {
  console.log(`[selectKidsGame] 🚀 Initializing launch sequence for gameId: "${gameId}"`);
  const hub = document.getElementById('games-hub');
  
  if (!hub) {
    console.error(`[selectKidsGame] ❌ Error: games-hub element was not found in the HTML!`);
  }

  // Deactivate any running game states
  try {
    if (balloonGameInstance) {
      console.log('[selectKidsGame] Stopping active BalloonPopper instance...');
      balloonGameInstance.stop();
    }
  } catch(e) { console.warn(e); }
  try {
    if (moleGameInstance) {
      console.log('[selectKidsGame] Stopping active WhackAMole instance...');
      moleGameInstance.stop();
    }
  } catch(e) { console.warn(e); }
  try {
    if (flappyGameInstance) {
      console.log('[selectKidsGame] Stopping active FlappyChiko instance...');
      flappyGameInstance.stop();
    }
  } catch(e) { console.warn(e); }
  try {
    if (catcherGameInstance) {
      console.log('[selectKidsGame] Stopping active FruitCatcher instance...');
      catcherGameInstance.stop();
    }
  } catch(e) { console.warn(e); }
  try {
    stopAutoplaySong();
  } catch(e) { console.warn(e); }

  try {
    if (gameId !== 'xylophone') {
      startBackgroundMelody();
    }
  } catch(e) { console.warn(e); }

  // Hide hub
  if (hub) {
    console.log('[selectKidsGame] Hiding games hub display...');
    hub.style.display = 'none';
  }

  // Open respective game arena
  try {
    console.log(`[selectKidsGame] Routing to game arena wrapper...`);
    if (gameId === 'balloon') {
      if (safeActivateArena('arena-balloon')) {
        console.log('[selectKidsGame] Instantiating BalloonPopper canvas game...');
        balloonGameInstance = new BalloonPopper('balloon-canvas', 'balloon-score');
        balloonGameInstance.start();
        console.log('[selectKidsGame] BalloonPopper started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-balloon');
      }
    } else if (gameId === 'memory') {
      if (safeActivateArena('arena-memory')) {
        console.log('[selectKidsGame] Instantiating MemoryMatch board...');
        initMemoryGame();
        console.log('[selectKidsGame] MemoryMatch started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-memory');
      }
    } else if (gameId === 'paint') {
      if (safeActivateArena('arena-paint')) {
        console.log('[selectKidsGame] Instantiating MagicPaint canvas workspace...');
        initPaintGame();
        console.log('[selectKidsGame] MagicPaint started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-paint');
      }
    } else if (gameId === 'mole') {
      if (safeActivateArena('arena-mole')) {
        console.log('[selectKidsGame] Instantiating WhackAMole canvas game...');
        moleGameInstance = new WhackAMole('mole-canvas', 'mole-score');
        moleGameInstance.start();
        console.log('[selectKidsGame] WhackAMole started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-mole');
      }
    } else if (gameId === 'flappy') {
      if (safeActivateArena('arena-flappy')) {
        console.log('[selectKidsGame] Instantiating FlappyChiko canvas game...');
        flappyGameInstance = new FlappyChiko('flappy-canvas', 'flappy-score');
        flappyGameInstance.start();
        console.log('[selectKidsGame] FlappyChiko started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-flappy');
      }
    } else if (gameId === 'xylophone') {
      if (safeActivateArena('arena-xylophone')) {
        console.log('[selectKidsGame] Magic Xylophone UI arena activated successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-xylophone');
      }
    } else if (gameId === 'catcher') {
      if (safeActivateArena('arena-catcher')) {
        console.log('[selectKidsGame] Instantiating FruitCatcher canvas game...');
        catcherGameInstance = new FruitCatcher('catcher-canvas', 'catcher-score-display', 'catcher-lives-display');
        catcherGameInstance.start();
        console.log('[selectKidsGame] FruitCatcher started successfully! ✅');
      } else {
        console.error('[selectKidsGame] ❌ Failed to activate arena-catcher');
      }
    } else {
      console.error(`[selectKidsGame] Unknown gameId requested: "${gameId}"`);
    }
  } catch(err) {
    console.error(`[selectKidsGame] ❌ Fatal exception while booting game "${gameId}":`, err);
  }
}

function closeKidsGameAndReturn() {
  // Stop all games
  try {
    if (balloonGameInstance) {
      balloonGameInstance.stop();
      balloonGameInstance = null;
    }
  } catch(e) {}
  try {
    if (moleGameInstance) {
      moleGameInstance.stop();
      moleGameInstance = null;
    }
  } catch(e) {}
  try {
    if (flappyGameInstance) {
      flappyGameInstance.stop();
      flappyGameInstance = null;
    }
  } catch(e) {}
  try {
    if (catcherGameInstance) {
      catcherGameInstance.stop();
      catcherGameInstance = null;
    }
  } catch(e) {}
  try {
    stopAutoplaySong();
  } catch(e) {}
  try {
    stopBackgroundMelody();
  } catch(e) {}

  // Hide all game arenas
  document.querySelectorAll('.game-container').forEach(arena => {
    arena.classList.remove('active');
  });

  // Show Hub
  const hub = document.getElementById('games-hub');
  if (hub) hub.style.display = 'flex';
}

// Setup static game listeners
function initGamesModule() {
  console.log('[Games Module] Initializing...');

  // Setup card selectors defensively (prevents crash if cached index.html has missing cards)
  safeAddListener('card-balloon', 'click', () => selectKidsGame('balloon'));
  safeAddListener('card-memory', 'click', () => selectKidsGame('memory'));
  safeAddListener('card-paint', 'click', () => selectKidsGame('paint'));
  safeAddListener('card-mole', 'click', () => selectKidsGame('mole'));
  safeAddListener('card-flappy', 'click', () => selectKidsGame('flappy'));
  safeAddListener('card-xylophone', 'click', () => selectKidsGame('xylophone'));
  safeAddListener('card-catcher', 'click', () => selectKidsGame('catcher'));

  // Setup Back-to-hub buttons defensively
  safeAddListener('btn-back-balloon', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-memory', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-paint', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-mole', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-flappy', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-xylophone', 'click', closeKidsGameAndReturn);
  safeAddListener('btn-back-catcher', 'click', closeKidsGameAndReturn);

  // Setup Xylophone static key click listeners
  document.querySelectorAll('.xy-key').forEach(key => {
    const playKey = () => {
      const note = key.getAttribute('data-note');
      key.classList.add('active');
      setTimeout(() => key.classList.remove('active'), 200);
      playXyNote(note);
    };

    key.addEventListener('mousedown', playKey);
    key.addEventListener('touchstart', (e) => {
      e.preventDefault();
      playKey();
    }, { passive: false });
  });

  // Autoplay buttons
  document.getElementById('btn-play-song-annem')?.addEventListener('click', () => playAutoplaySong('annem'));
  document.getElementById('btn-play-song-balik')?.addEventListener('click', () => playAutoplaySong('balik'));
  document.getElementById('btn-stop-song')?.addEventListener('click', stopAutoplaySong);
}
