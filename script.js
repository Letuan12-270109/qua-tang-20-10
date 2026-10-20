const intro = document.querySelector('#intro');
const envelope = document.querySelector('#openGift');
const openLabel = document.querySelector('#openLabel');
const main = document.querySelector('#mainContent');
const stage = document.querySelector('#gardenStage');
const bloomButton = document.querySelector('#bloomButton');
const bloomCount = document.querySelector('#bloomCount');

let flowerCount = stage.querySelectorAll('.garden-flower').length;
let nextGardenFlower = 0;
// The first four flowers are rose, pink rose, sunflower and tulip.
// Cycle through all nine cutouts from a12 without adding new image requests.
const gardenFlowerOrder = [2, 4, 6, 7, 8, 0, 1, 3, 5];
let giftOpened = false;

function scatterPetals(amount = 18) {
  const colors = ['#df5a62', '#f2b4ad', '#f7d8d2', '#f2a744'];
  for (let i = 0; i < amount; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal-fall';
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.top = `${-5 - Math.random() * 20}vh`;
    petal.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
    petal.style.setProperty('--petal-color', colors[Math.floor(Math.random() * colors.length)]);
    petal.style.animationDelay = `${Math.random() * 0.45}s`;
    petal.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    document.body.appendChild(petal);
    window.setTimeout(() => petal.remove(), 4500);
  }
}

function openGift() {
  if (giftOpened) return;
  giftOpened = true;
  envelope.classList.add('is-opening');
  scatterPetals(24);
  window.setTimeout(() => {
    intro.classList.add('opened');
    document.body.classList.remove('locked');
    main.setAttribute('aria-hidden', 'false');
    document.querySelector('.letter-section').classList.add('visible');
  }, 1050);
}

envelope.addEventListener('click', openGift);
openLabel.addEventListener('click', openGift);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));

function growFlower(x, y) {
  const rect = stage.getBoundingClientRect();
  const flower = document.createElement('div');
  const spriteIndex = gardenFlowerOrder[nextGardenFlower % gardenFlowerOrder.length];
  nextGardenFlower += 1;
  flower.className = 'new-flower';
  flower.setAttribute('aria-hidden', 'true');
  const sprite = document.createElement('span');
  sprite.className = 'garden-flower-sprite';
  sprite.dataset.row = Math.floor(spriteIndex / 3);
  sprite.style.setProperty('--flower-col', spriteIndex % 3);
  flower.appendChild(sprite);
  flower.style.left = `${Math.max(14, Math.min(86, ((x - rect.left) / rect.width) * 100))}%`;
  flower.style.bottom = `${Math.max(9, Math.min(36, ((rect.bottom - y) / rect.height) * 100))}%`;
  flower.style.setProperty('--flower-height', `${Math.min(rect.width * .4, 145 + Math.random() * 70)}px`);
  flower.style.setProperty('--lean', `${-13 + Math.random() * 26}deg`);
  stage.appendChild(flower);
  const extraFlowers = stage.querySelectorAll('.new-flower');
  if (extraFlowers.length > 48) extraFlowers[0].remove();

  flowerCount += 1;
  bloomCount.textContent = flowerCount === 1
    ? 'Một bông hoa vừa nở dành riêng cho chị ✿'
    : `Khu vườn có ${flowerCount} bông hoa và ${flowerCount} lời chúc ♡`;
  const hint = stage.querySelector('.garden-hint');
  if (hint) hint.style.opacity = '0';
}

stage.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.garden-hint')) return;
  growFlower(event.clientX, event.clientY);
});
bloomButton.addEventListener('click', () => {
  const rect = stage.getBoundingClientRect();
  growFlower(rect.left + rect.width * (.2 + Math.random() * .6), rect.top + rect.height * (.35 + Math.random() * .36));
  scatterPetals(8);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !giftOpened && (!openingStory || openingStory.hidden)) openGift();
});

const openingStory = document.querySelector('#openingStory');
const storyScenes = Array.from(openingStory.querySelectorAll('[data-story-scene]'));
const fireworksCanvases = Array.from(document.querySelectorAll('.fireworks-canvas'));
const magicThreads = Array.from(document.querySelectorAll('.magic-thread'));
const magicDiscFrame = document.querySelector('#magicDiscFrame');
const magicFlowerCanvas = document.querySelector('#magicFlowerCanvas');
const enterGift = document.querySelector('#enterGift');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const FIREWORKS_SHOW_MS = 12000;
const MAGIC_DISC_SHOW_MS = 28000;
const MAGIC_PHOTOS_START_MS = 3000;
const MAGIC_PHOTO_MESSAGE_START_MS = 9850;
const MAGIC_PHOTO_RETURN_START_MS = MAGIC_PHOTO_MESSAGE_START_MS + 1000;
const MAGIC_PHOTOS_GATHERED_MS = MAGIC_PHOTO_RETURN_START_MS + 550 + 2650;
const MAGIC_FLOWER_FIREWORK_START_MS = MAGIC_PHOTOS_GATHERED_MS + 3000;
const MAGIC_FINALE_REVEAL_MS = MAGIC_FLOWER_FIREWORK_START_MS + 6500;

let activeScene = 0;
let magicDiscLoaded = false;
let magicDiscShowTimer = 0;
let magicPhotosTimer = 0;
let magicPhotoMessageTimer = 0;
let magicPhotoReturnTimer = 0;
let magicFlowerShowTimer = 0;
let magicFinaleRevealTimer = 0;
let magicFlowerFrame = 0;
let magicFlowerStartedAt = 0;
let magicFlowerContext = null;
let magicPetalSheets = [];
let magicPetalRotations = [];
let magicPetalSheetsPromise = null;
let magicPetals = [];
let nextRainPetalAt = 0;
let fireworksCanvas = null;
let fireworksFrame = 0;
let fireworksShowTimer = 0;
let fireworksCopyTimer = 0;
let lastFireworkTime = 0;
let rockets = [];
let sparks = [];
let canvasContext = null;
let audioContext = null;
let explosionNoise = null;

function sizeMagicThreads() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const photoSize = Math.min(width * .44, height * .28);
  const gridCornerDistance = Math.SQRT2 * photoSize;
  const exitDistance = Math.hypot(width * .68, height * .58);
  const targetLength = Math.min(100, (gridCornerDistance / exitDistance) * 100).toFixed(3);
  magicThreads.forEach((thread) => thread.style.setProperty('--thread-target', targetLength));
}

sizeMagicThreads();
window.addEventListener('resize', sizeMagicThreads, { passive: true });

function sizeMagicFlowerCanvas() {
  if (!magicFlowerCanvas) return;
  const rect = magicFlowerCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  magicFlowerCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  magicFlowerCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  magicFlowerContext = magicFlowerCanvas.getContext('2d');
  if (magicFlowerContext) {
    magicFlowerContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    magicFlowerContext.imageSmoothingEnabled = true;
    magicFlowerContext.imageSmoothingQuality = 'high';
  }
}

function loadMagicPetalSheets() {
  if (magicPetalSheetsPromise) return magicPetalSheetsPromise;
  magicPetalSheetsPromise = Promise.all(['images/petals-cherry.png', 'images/petals-rose.png'].map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  }))).then((images) => {
    magicPetalSheets = images.filter(Boolean);
    magicPetalRotations = [];
    magicPetalSheets.forEach((image) => {
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          const sprite = document.createElement('canvas');
          sprite.width = 48;
          sprite.height = 43;
          const context = sprite.getContext('2d');
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          context.drawImage(image, column * image.naturalWidth / 4, row * image.naturalHeight / 3, image.naturalWidth / 4, image.naturalHeight / 3, 0, 0, sprite.width, sprite.height);
          const rotations = [];
          for (let turn = 0; turn < 8; turn += 1) {
            const rotated = document.createElement('canvas');
            rotated.width = 72;
            rotated.height = 72;
            const rotatedContext = rotated.getContext('2d');
            rotatedContext.imageSmoothingEnabled = true;
            rotatedContext.imageSmoothingQuality = 'high';
            rotatedContext.translate(rotated.width / 2, rotated.height / 2);
            rotatedContext.rotate((Math.PI * 2 * turn) / 8);
            rotatedContext.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
            rotations.push(rotated);
          }
          magicPetalRotations.push(rotations);
        }
      }
    });
    magicPetalSheets = [];
  });
  return magicPetalSheetsPromise;
}

function makeFlowerPetal(x, y, burst = false, bornAt = 0) {
  const spriteIndex = Math.floor(Math.random() * magicPetalRotations.length);
  const size = (Math.min(window.innerWidth, window.innerHeight) / 100) * (1.8 + Math.random() * (burst ? 2.5 : 1.6));
  const angle = Math.random() * Math.PI * 2;
  const speed = burst ? 100 + Math.random() * 250 : 18 + Math.random() * 85;
  return { spriteIndex, x, y, vx: burst ? Math.cos(angle) * speed + (Math.random() - .5) * 120 : (Math.random() - .5) * 34, vy: burst ? Math.sin(angle) * speed - 65 : 18 + Math.random() * 86, size, bornAt, rotation: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * 4.8, alpha: .76 + Math.random() * .24, lift: burst ? .8 + Math.random() * .9 : 0, fallDelay: Math.random() * .8, life: 4.4 + Math.random() * 2.3 };
}

function startMagicFlowerShow() {
  if (!magicFlowerCanvas) return;
  sizeMagicFlowerCanvas();
  loadMagicPetalSheets();
  const rect = magicFlowerCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const now = performance.now();
  magicFlowerStartedAt = now;
  nextRainPetalAt = 1.9;
  magicPetals = Array.from({ length: 126 }, () => makeFlowerPetal(cx, cy, true));
  if (magicFlowerContext) {
    magicFlowerContext.clearRect(0, 0, rect.width, rect.height);
    magicFlowerContext.shadowColor = 'rgba(255,198,132,.95)';
    magicFlowerContext.shadowBlur = 30;
    const glow = magicFlowerContext.createRadialGradient(cx, cy, 1, cx, cy, Math.min(rect.width, rect.height) * .12);
    glow.addColorStop(0, 'rgba(255,255,235,.98)');
    glow.addColorStop(.18, 'rgba(255,204,124,.78)');
    glow.addColorStop(1, 'rgba(255,136,194,0)');
    magicFlowerContext.fillStyle = glow;
    magicFlowerContext.beginPath();
    magicFlowerContext.arc(cx, cy, Math.min(rect.width, rect.height) * .13, 0, Math.PI * 2);
    magicFlowerContext.fill();
    magicFlowerContext.shadowBlur = 0;
  }
  const rectAudio = magicFlowerCanvas.getBoundingClientRect();
  playLaunchSound(cx, rectAudio.width);
  window.setTimeout(() => { if (activeScene === 1) playExplosionSound(cx, rectAudio.width); }, 1020);
  if (magicDiscLoaded) magicDiscFrame.contentWindow.postMessage({ type: 'pause-magic-disc' }, '*');
  drawMagicFlowerShow.lastTime = 0;
  storyScenes[1].classList.add('magic-petals-active');
  magicFlowerFrame = window.requestAnimationFrame(drawMagicFlowerShow);
}

function drawMagicFlowerShow(time) {
  if (activeScene !== 1 || !magicFlowerContext) return;
  const ctx = magicFlowerContext;
  const width = magicFlowerCanvas.clientWidth;
  const height = magicFlowerCanvas.clientHeight;
  const elapsed = (time - magicFlowerStartedAt) / 1000;
  const delta = Math.min(.035, Math.max(.001, (time - (drawMagicFlowerShow.lastTime || time)) / 1000));
  drawMagicFlowerShow.lastTime = time;
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  if (elapsed < 1.05) {
    const progress = elapsed / 1.05;
    const y = height * (.88 - progress * .38);
    const glow = ctx.createRadialGradient(cx, y, 0, cx, y, 17 + progress * 14);
    glow.addColorStop(0, 'rgba(255,255,245,1)');
    glow.addColorStop(.24, 'rgba(255,208,127,.9)');
    glow.addColorStop(1, 'rgba(255,141,190,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, y, 19 + progress * 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,221,169,.74)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, y + 12); ctx.lineTo(cx, y + 52); ctx.stroke();
  }
  if (elapsed > 1.8 && elapsed < 6.1 && elapsed > nextRainPetalAt) {
    const amount = Math.min(14, 4 + Math.floor((elapsed - 1.8) * 2));
    for (let i = 0; i < amount; i += 1) magicPetals.push(makeFlowerPetal(Math.random() * width, -24 - Math.random() * height * .24, false, elapsed));
    nextRainPetalAt = elapsed + .12;
  }
  for (let index = magicPetals.length - 1; index >= 0; index -= 1) {
    const petal = magicPetals[index];
    const age = elapsed - petal.bornAt - petal.fallDelay;
    if (age > petal.life || petal.y > height + 80) {
      magicPetals[index] = magicPetals[magicPetals.length - 1];
      magicPetals.pop();
      continue;
    }
    const wind = elapsed < 2.15 ? -48 : elapsed < 6.1 ? 25 : 8;
    petal.vy += (elapsed < 2.15 ? -12 : 74) * delta;
    petal.vx += wind * delta * .08;
    petal.x += petal.vx * delta;
    petal.y += petal.vy * delta;
    petal.rotation += petal.spin * delta;
    const fade = age > petal.life - .8 ? Math.max(0, (petal.life - age) / .8) : 1;
    const rotations = magicPetalRotations[petal.spriteIndex];
    if (!rotations) continue;
    const turn = ((Math.round(petal.rotation * 8 / (Math.PI * 2)) % 8) + 8) % 8;
    ctx.globalAlpha = petal.alpha * fade;
    ctx.drawImage(rotations[turn], petal.x - petal.size / 2, petal.y - petal.size * .62, petal.size, petal.size * 1.24);
  }
  ctx.globalAlpha = 1;
  magicFlowerFrame = window.requestAnimationFrame(drawMagicFlowerShow);
}

window.addEventListener('resize', () => { if (activeScene === 1 && storyScenes[1].classList.contains('magic-petals-active')) sizeMagicFlowerCanvas(); }, { passive: true });

function isFireworksScene(index = activeScene) {
  return index === 2;
}

function getFireworksCanvas(index = activeScene) {
  return fireworksCanvases.find((canvas) => {
    const scene = canvas.closest('[data-story-scene]');
    return scene && Number(scene.dataset.storyScene) === index;
  }) || null;
}

function setStoryScene(index) {
  if (index < 0 || index >= storyScenes.length) return;
  window.clearTimeout(magicDiscShowTimer);
  window.clearTimeout(magicPhotosTimer);
  window.clearTimeout(magicPhotoMessageTimer);
  window.clearTimeout(magicPhotoReturnTimer);
  window.clearTimeout(magicFlowerShowTimer);
  window.clearTimeout(magicFinaleRevealTimer);
  window.cancelAnimationFrame(magicFlowerFrame);
  magicFlowerFrame = 0;
  magicFlowerShowTimer = 0;
  magicFinaleRevealTimer = 0;
  storyScenes[1].classList.remove('magic-petals-active', 'magic-finale-visible');
  magicDiscShowTimer = 0;
  magicPhotosTimer = 0;
  magicPhotoMessageTimer = 0;
  magicPhotoReturnTimer = 0;
  storyScenes[1].classList.remove('magic-photos-active', 'magic-message-visible', 'magic-threads-active', 'magic-photos-returning');
  if (activeScene === 1 && index !== 1 && magicDiscLoaded) {
    magicDiscFrame.contentWindow.postMessage({ type: 'pause-magic-disc' }, '*');
  }
  stopFireworks();
  activeScene = index;
  storyScenes.forEach((scene, sceneIndex) => {
    const isActive = sceneIndex === index;
    scene.hidden = !isActive;
    scene.setAttribute('aria-hidden', String(!isActive));
  });
  if (index === 1) {
    if (!magicDiscLoaded) {
      magicDiscFrame.addEventListener('load', () => {
        magicDiscLoaded = true;
        magicDiscFrame.contentWindow.postMessage({ type: 'resume-magic-disc' }, '*');
      }, { once: true });
      magicDiscFrame.src = magicDiscFrame.dataset.src;
    } else {
      magicDiscFrame.contentWindow.postMessage({ type: 'resume-magic-disc' }, '*');
    }
    loadMagicPetalSheets();
    magicPhotosTimer = window.setTimeout(() => {
      if (activeScene === 1) storyScenes[1].classList.add('magic-photos-active');
    }, MAGIC_PHOTOS_START_MS);
    magicPhotoMessageTimer = window.setTimeout(() => {
      if (activeScene === 1) storyScenes[1].classList.add('magic-message-visible');
    }, MAGIC_PHOTO_MESSAGE_START_MS);
    magicPhotoReturnTimer = window.setTimeout(() => {
      if (activeScene === 1) storyScenes[1].classList.add('magic-threads-active', 'magic-photos-returning');
    }, MAGIC_PHOTO_RETURN_START_MS);
    magicFlowerShowTimer = window.setTimeout(() => {
      if (activeScene === 1) startMagicFlowerShow();
    }, MAGIC_FLOWER_FIREWORK_START_MS);
    magicFinaleRevealTimer = window.setTimeout(() => {
      if (activeScene === 1) storyScenes[1].classList.add('magic-finale-visible');
    }, MAGIC_FINALE_REVEAL_MS);
    magicDiscShowTimer = window.setTimeout(() => {
      if (activeScene === 1) setStoryScene(2);
    }, MAGIC_DISC_SHOW_MS);
  }
  if (isFireworksScene(index)) {
    fireworksCanvas = getFireworksCanvas(index);
    startFireworks();
    const fireworksScene = storyScenes[index];
    fireworksScene.classList.add('is-performing');
    fireworksCopyTimer = window.setTimeout(() => fireworksScene.classList.add('show-underway'), 1800);
    fireworksShowTimer = window.setTimeout(() => {
      fireworksScene.classList.add('show-finale');
      fireworksShowTimer = window.setTimeout(() => setStoryScene(3), 1000);
    }, FIREWORKS_SHOW_MS - 1000);
  }
}

function leaveStory() {
  stopFireworks();
  openingStory.classList.add('is-leaving');
  openingStory.setAttribute('aria-hidden', 'true');
  intro.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => { openingStory.hidden = true; }, 820);
}

openingStory.querySelectorAll('[data-story-next]').forEach((button) => {
  button.addEventListener('click', () => setStoryScene(activeScene + 1));
});
openingStory.querySelectorAll('[data-story-prev]').forEach((button) => {
  button.addEventListener('click', () => setStoryScene(activeScene - 1));
});
enterGift.addEventListener('click', leaveStory);

function sizeFireworksCanvas() {
  const rect = fireworksCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  fireworksCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  fireworksCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  canvasContext = fireworksCanvas.getContext('2d');
  if (canvasContext) canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return null;
    audioContext = new AudioContextConstructor();
  }
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}

function playLaunchSound(x, width) {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(145, now);
  oscillator.frequency.exponentialRampToValueAtTime(640, now + .62);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(2100, now + .58);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.075, now + .055);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .68);
  oscillator.connect(filter);
  filter.connect(gain);
  let output = gain;
  if (context.createStereoPanner) {
    const pan = context.createStereoPanner();
    pan.pan.setValueAtTime(Math.max(-1, Math.min(1, (x / width) * 2 - 1)), now);
    gain.connect(pan);
    output = pan;
  }
  output.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + .7);
}

function playExplosionSound(x, width) {
  const context = getAudioContext();
  if (!context) return;
  if (!explosionNoise) {
    const length = Math.floor(context.sampleRate * .85);
    explosionNoise = context.createBuffer(1, length, context.sampleRate);
    const data = explosionNoise.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const fade = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * fade * fade;
    }
  }
  const now = context.currentTime;
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = explosionNoise;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1900, now);
  filter.frequency.exponentialRampToValueAtTime(360, now + .72);
  noiseGain.gain.setValueAtTime(.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(.16, now + .018);
  noiseGain.gain.exponentialRampToValueAtTime(.0001, now + .78);
  noise.connect(filter);
  filter.connect(noiseGain);

  const boom = context.createOscillator();
  const boomGain = context.createGain();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(92, now);
  boom.frequency.exponentialRampToValueAtTime(38, now + .52);
  boomGain.gain.setValueAtTime(.0001, now);
  boomGain.gain.exponentialRampToValueAtTime(.11, now + .02);
  boomGain.gain.exponentialRampToValueAtTime(.0001, now + .58);
  boom.connect(boomGain);

  let output = context.destination;
  if (context.createStereoPanner) {
    const pan = context.createStereoPanner();
    pan.pan.setValueAtTime(Math.max(-1, Math.min(1, (x / width) * 2 - 1)), now);
    pan.connect(context.destination);
    output = pan;
  }
  noiseGain.connect(output);
  boomGain.connect(output);
  noise.start(now);
  noise.stop(now + .8);
  boom.start(now);
  boom.stop(now + .6);
}

function burst(x, y, hue, count = 72) {
  const spread = Math.max(45, Math.min(window.innerWidth, window.innerHeight) * .19);
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * .09;
    const speed = spread * (.35 + Math.random() * .7);
    const life = .9 + Math.random() * .62;
    sparks.push({
      x, y, previousX: x, previousY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 32 + Math.random() * 28,
      life,
      maxLife: life,
      radius: 1 + Math.random() * 1.7,
      hue: hue + Math.random() * 25 - 12
    });
  }
  playExplosionSound(x, fireworksCanvas.clientWidth);
}

function launchFirework(width, height, playSound = true) {
  const x = width * (.16 + Math.random() * .68);
  const targetY = height * (.16 + Math.random() * .38);
  const palette = [342, 24, 43, 287, 190, 50, 12];
  const hue = palette[Math.floor(Math.random() * palette.length)];
  const distance = height - targetY;
  rockets.push({ x, y: height + 8, targetY, speed: 420 + Math.random() * 130, hue, distance });
  if (playSound) playLaunchSound(x, width);
}

function startFireworks(playInitialSound = true) {
  if (!fireworksCanvas) fireworksCanvas = getFireworksCanvas(activeScene);
  if (!fireworksCanvas) return;
  if (!canvasContext) sizeFireworksCanvas();
  if (!canvasContext) return;
  const rect = fireworksCanvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  rockets = [];
  sparks = [];
  lastFireworkTime = 0;
  startFireworks.lastLaunch = 0;
  getAudioContext();
  launchFirework(width, height, playInitialSound);
  fireworksFrame = window.requestAnimationFrame(drawFireworks);
}

function drawFireworks(time) {
  if (!isFireworksScene() || !canvasContext) return;
  const width = fireworksCanvas.clientWidth;
  const height = fireworksCanvas.clientHeight;
  const delta = lastFireworkTime ? Math.min((time - lastFireworkTime) / 1000, .035) : .016;
  lastFireworkTime = time;
  canvasContext.clearRect(0, 0, width, height);

  const launchInterval = reduceMotion.matches ? 220 : 105;
  if (time - (startFireworks.lastLaunch || 0) > launchInterval) {
    launchFirework(width, height);
    startFireworks.lastLaunch = time;
  }

  rockets = rockets.filter((rocket) => {
    rocket.y -= rocket.speed * delta;
    const trail = canvasContext.createLinearGradient(rocket.x, rocket.y, rocket.x, rocket.y + 35);
    trail.addColorStop(0, `hsla(${rocket.hue}, 100%, 87%, .9)`);
    trail.addColorStop(1, `hsla(${rocket.hue}, 90%, 70%, 0)`);
    canvasContext.beginPath();
    canvasContext.strokeStyle = trail;
    canvasContext.lineWidth = 2;
    canvasContext.moveTo(rocket.x, rocket.y);
    canvasContext.lineTo(rocket.x, rocket.y + 35);
    canvasContext.stroke();
    if (rocket.y <= rocket.targetY) {
      const sparkCount = reduceMotion.matches
        ? 58 + Math.floor(Math.random() * 23)
        : 78 + Math.floor(Math.random() * 31);
      burst(rocket.x, rocket.targetY, rocket.hue, sparkCount);
      return false;
    }
    return true;
  });

  canvasContext.globalCompositeOperation = 'lighter';
  canvasContext.lineCap = 'round';
  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index];
    spark.previousX = spark.x;
    spark.previousY = spark.y;
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.vy += spark.gravity * delta;
    spark.vx *= .992;
    spark.life -= delta;
    if (spark.life <= 0) {
      sparks[index] = sparks[sparks.length - 1];
      sparks.pop();
      continue;
    }
    const alpha = Math.max(0, spark.life / spark.maxLife);
    canvasContext.beginPath();
    canvasContext.strokeStyle = `hsla(${spark.hue}, 96%, 78%, ${alpha})`;
    canvasContext.lineWidth = spark.radius * 1.5;
    canvasContext.moveTo(spark.previousX, spark.previousY);
    canvasContext.lineTo(spark.x, spark.y);
    canvasContext.stroke();
  }
  canvasContext.globalCompositeOperation = 'source-over';
  canvasContext.lineCap = 'butt';
  fireworksFrame = window.requestAnimationFrame(drawFireworks);
}

function stopFireworks(preserveShowTimers = false) {
  if (fireworksFrame) window.cancelAnimationFrame(fireworksFrame);
  fireworksFrame = 0;
  if (canvasContext && fireworksCanvas) canvasContext.clearRect(0, 0, fireworksCanvas.clientWidth, fireworksCanvas.clientHeight);
  rockets = [];
  sparks = [];
  canvasContext = null;
  fireworksCanvas = null;
  if (!preserveShowTimers) {
    window.clearTimeout(fireworksShowTimer);
    window.clearTimeout(fireworksCopyTimer);
    fireworksShowTimer = 0;
    fireworksCopyTimer = 0;
    storyScenes[2].classList.remove('is-performing', 'show-underway', 'show-finale');
  }
}

window.addEventListener('resize', () => {
  if (!isFireworksScene()) return;
  stopFireworks(true);
  fireworksCanvas = getFireworksCanvas(activeScene);
  sizeFireworksCanvas();
  startFireworks(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFireworks(true);
  else if (isFireworksScene()) {
    fireworksCanvas = getFireworksCanvas(activeScene);
    startFireworks(false);
  }
});

window.addEventListener('keydown', (event) => {
  if (openingStory.hidden) return;
  if (event.key === 'ArrowRight' && activeScene < 2) setStoryScene(activeScene + 1);
  if (event.key === 'ArrowLeft' && activeScene > 0) setStoryScene(activeScene - 1);
});
