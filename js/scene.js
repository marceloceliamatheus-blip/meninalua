/**
 * O universo em canvas: estrelas, estrelas cadentes, galáxia, coração,
 * fotos em órbita e palavras flutuando — com câmera que gira, aproxima
 * e responde ao toque.
 */
import { TAU, random, gaussian, clamp, easeOutCubic } from './utils.js';
import {
  createGlowSprite, createTextSprite, createEmojiSprite, createPhotoThumb,
  THUMB_SIZE, THUMB_PADDING,
} from './sprites.js';
import { createHeartTexture, createHeartParticles, heartbeat, HEART_PARTICLE_COLORS } from './heart.js';

/* ---------- ajustes da cena ---------- */
const CAMERA_DISTANCE = 22;
const HEART_HEIGHT = 5.6;
const PHOTO_RADIUS = 0.98;
const AUTO_SPIN = 0.07; // rad/s
const PITCH_LIMITS = [0.02, 1.25];
const ZOOM_LIMITS = [0.55, 4.5];
const DOUBLE_TAP_ZOOM = 3.6;
const BACKGROUND = '#05010d';

/** Órbitas das fotos (raio, quantidade de fotos, inclinação). */
const ORBITS = [
  { radius: 4.3, count: 3, tilt: 0.06 },
  { radius: 5.3, count: 3, tilt: -0.09 },
  { radius: 6.3, count: 3, tilt: 0.11 },
  { radius: 7.3, count: 3, tilt: -0.05 },
  { radius: 8.3, count: 4, tilt: 0.08 },
];

/** Momento (em segundos após "Toque aqui") em que cada parte aparece. */
const TIMELINE = {
  galaxyDuration: 2.4,
  heartParticles: 1.8, heartParticlesDuration: 2.2,
  heartGlow: 3.2, heartText: 3.6,
  photos: 4.4, words: 5,
};

const GALAXY_COLORS = ['#fff6e8', '#ffd0ec', '#ff6fb5', '#c77dff', '#7aa8ff'];
const GALAXY_ALPHAS = [0.95, 0.85, 0.75, 0.7, 0.65];

const IS_LOW_POWER = window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 700;
const COUNTS = IS_LOW_POWER
  ? { stars: 420, galaxy: 1700, heart: 900 }
  : { stars: 800, galaxy: 3200, heart: 1500 };

export class Universe {
  constructor(canvas, { photos, lovePhrases, floatingWords, floatingEmojis, onPhotoTap }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onPhotoTap = onPhotoTap;

    this.camera = { yaw: 0.3, pitch: 0, zoom: 1, targetZoom: null, spinVelocity: 0, pitchVelocity: 0 };
    this.userMovedCamera = false;
    this.time = 0;
    this.startTime = null; // definido em start()
    this.lastFrame = performance.now();
    this.galaxyRotation = 0;
    this.hitAreas = [];
    this.meteors = [];
    this.nextMeteorIn = 2.5;

    this.sprites = {
      glow: createGlowSprite(128, [[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,200,230,.85)'], [0.45, 'rgba(255,90,170,.35)'], [1, 'rgba(255,60,150,0)']]),
      nebulas: [
        createGlowSprite(96, [[0, 'rgba(150,70,255,.9)'], [1, 'rgba(150,70,255,0)']]),
        createGlowSprite(96, [[0, 'rgba(255,70,160,.9)'], [1, 'rgba(255,70,160,0)']]),
        createGlowSprite(96, [[0, 'rgba(70,130,255,.9)'], [1, 'rgba(70,130,255,0)']]),
        createGlowSprite(96, [[0, 'rgba(60,200,190,.7)'], [1, 'rgba(60,200,190,0)']]),
      ],
    };
    this.heartTexture = createHeartTexture(lovePhrases);
    this.heartParticles = createHeartParticles(COUNTS.heart, HEART_HEIGHT);

    this.createStars();
    this.createGalaxy();
    this.createNebulas();
    this.createPhotoPlanets(photos);
    this.createFloaters(floatingWords, floatingEmojis);

    this.resize();
    this.camera.pitch = this.defaultPitch();
    this.bindInput();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    requestAnimationFrame((now) => this.frame(now));
  }

  /** Começa a animação de abertura (galáxia se formando, coração, fotos). */
  start() {
    this.startTime = performance.now();
  }

  /* ================= criação dos elementos ================= */

  createStars() {
    this.stars = Array.from({ length: COUNTS.stars }, (_, i) => {
      const u = random(-1, 1);
      const theta = random(0, TAU);
      const distance = random(55, 95);
      const ring = Math.sqrt(1 - u * u);
      return {
        x: Math.cos(theta) * ring * distance, y: u * distance, z: Math.sin(theta) * ring * distance,
        size: random(0.6, 1.8), group: i % 3, // 3 grupos que piscam em ritmos diferentes
      };
    });
  }

  createGalaxy() {
    const n = COUNTS.galaxy;
    const g = {
      x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), size: new Float32Array(n),
      fromX: new Float32Array(n), fromY: new Float32Array(n), fromZ: new Float32Array(n), delay: new Float32Array(n),
      byColor: GALAXY_COLORS.map(() => []),
    };
    const pick = (a, b, chanceA) => (Math.random() < chanceA ? a : b);

    for (let i = 0; i < n; i++) {
      let radius;
      let angle;
      if (i % 7 === 0) {
        radius = random(1, 12); // poeira solta
        angle = random(0, TAU);
      } else {
        radius = 0.8 + Math.random() ** 1.4 * 11.5; // 3 braços em espiral
        angle = (i % 3) * (TAU / 3) + radius * 0.52 + gaussian() * (0.22 + radius * 0.02);
      }
      g.x[i] = Math.cos(angle) * radius + gaussian() * 0.3;
      g.z[i] = Math.sin(angle) * radius + gaussian() * 0.3;
      g.y[i] = gaussian() * (0.35 - radius * 0.018);
      g.size[i] = radius < 2 ? random(0.05, 0.1) : random(0.025, 0.065);

      const fromAngle = random(0, TAU);
      const fromDistance = random(18, 34);
      g.fromX[i] = Math.cos(fromAngle) * fromDistance;
      g.fromY[i] = random(-10, 10);
      g.fromZ[i] = Math.sin(fromAngle) * fromDistance;
      g.delay[i] = Math.random() * 0.9;

      // cor pelo raio: centro claro → rosa → roxo → azul nas bordas
      const color =
        radius < 2 ? 0 :
        radius < 4 ? pick(0, 1, 0.6) :
        radius < 6.5 ? pick(1, 2, 0.55) :
        radius < 9 ? pick(2, 3, 0.5) : pick(3, 4, 0.5);
      g.byColor[color].push(i);
    }
    this.galaxy = g;
  }

  createNebulas() {
    this.nebulas = Array.from({ length: 8 }, (_, i) => {
      const angle = random(0, TAU);
      const distance = random(3, 11);
      return {
        x: Math.cos(angle) * distance, y: random(-1.2, 1.2), z: Math.sin(angle) * distance,
        size: random(7, 13), sprite: this.sprites.nebulas[i % 4], alpha: random(0.08, 0.15),
      };
    });
  }

  createPhotoPlanets(photos) {
    this.planets = [];
    let index = 0;
    ORBITS.forEach((orbit) => {
      const offset = random(0, TAU);
      for (let j = 0; j < orbit.count && index < photos.length; j++, index++) {
        const planet = {
          index, radius: orbit.radius, tilt: orbit.tilt,
          angle: offset + (j * TAU) / orbit.count,
          speed: 0.62 / orbit.radius ** 0.8, // órbitas de dentro giram mais rápido
          bobPhase: random(0, TAU), thumb: null,
        };
        const image = new Image();
        image.onload = () => { planet.thumb = createPhotoThumb(image, photos[planet.index].focus); };
        image.onerror = () => console.error('Não foi possível carregar', photos[planet.index].src);
        image.src = photos[planet.index].src;
        this.planets.push(planet);
      }
    });
  }

  createFloaters(words, emojis) {
    const words3d = words.map((word, i) => ({
      sprite: createTextSprite(word, 34, i % 2 ? '#ffd6ec' : '#ffffff'), height: 0.44,
      radius: random(2.6, 9.5), y: random(-1.6, 2.8), angle: random(0, TAU),
      speed: random(0.05, 0.14) * (i % 3 ? 1 : -1), phase: random(0, TAU),
    }));
    const emojis3d = emojis.map((emoji, i) => ({
      sprite: createEmojiSprite(emoji), height: 0.5,
      radius: random(2.4, 9), y: random(-1.8, 2.6), angle: random(0, TAU),
      speed: random(0.06, 0.16) * (i % 2 ? 1 : -1), phase: random(0, TAU),
    }));
    this.floaters = [...words3d, ...emojis3d];
  }

  spawnMeteor(big = Math.random() < 0.18) {
    if (this.meteors.length > 2) return;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const angle = random(0.3, 0.6);
    const speed = (big ? random(380, 480) : random(500, 700)) * Math.max(0.75, Math.min(this.width, this.height) / 420);
    this.meteors.push({
      x: (direction > 0 ? random(-0.15, 0.55) : random(0.45, 1.15)) * this.width,
      y: random(-0.05, 0.3) * this.height,
      vx: Math.cos(angle) * speed * direction, vy: Math.sin(angle) * speed,
      life: 0, duration: big ? random(1.6, 2.2) : random(1.0, 1.5),
      tail: big ? 0.42 : 0.28, width: big ? 2.3 : 1.5, alpha: big ? 1 : 0.8,
      headColor: 'rgba(255,255,255,.95)',
      tailColor: big ? 'rgba(255,170,220,.6)' : 'rgba(210,200,255,.5)',
    });
  }

  /* ================= tela e câmera ================= */

  defaultPitch() {
    return this.height > this.width ? 0.82 : 0.42; // em pé, olha mais de cima
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const portrait = this.height > this.width;
    this.baseFocal = CAMERA_DISTANCE * (portrait
      ? Math.min(this.width * 0.5 / 6.4, this.height * 0.5 / 7.5)
      : Math.min(this.width * 0.5 / 8.8, this.height * 0.5 / 6.4));
    if (!this.userMovedCamera) this.camera.pitch = this.defaultPitch();
  }

  bindInput() {
    const pointers = new Map();
    this.activePointers = pointers;
    let pinchStart = null;
    let press = null;
    let lastMoveAt = 0;
    let lastEmptyTapAt = 0;
    const cam = this.camera;

    const distanceBetween = ([a, b]) => Math.hypot(a.x - b.x, a.y - b.y);

    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.userMovedCamera = true;
      if (pointers.size === 1) {
        press = { x: e.clientX, y: e.clientY, at: performance.now(), moved: false };
        cam.spinVelocity = 0;
        cam.pitchVelocity = 0;
      } else if (pointers.size === 2) {
        pinchStart = { distance: distanceBetween([...pointers.values()]), zoom: cam.zoom };
        if (press) press.moved = true;
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const previous = pointers.get(e.pointerId);
      if (!previous) return;
      const dx = e.clientX - previous.x;
      const dy = e.clientY - previous.y;
      previous.x = e.clientX;
      previous.y = e.clientY;

      if (pointers.size === 1) {
        if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) press.moved = true;
        // gira junto com o dedo: arrastar para a direita leva a frente para a direita
        cam.yaw += dx * 0.006;
        cam.pitch = clamp(cam.pitch + dy * 0.004, ...PITCH_LIMITS);
        cam.spinVelocity = dx * 0.36;
        cam.pitchVelocity = dy * 0.24;
        lastMoveAt = performance.now();
      } else if (pointers.size === 2 && pinchStart) {
        cam.zoom = clamp(pinchStart.zoom * distanceBetween([...pointers.values()]) / pinchStart.distance, ...ZOOM_LIMITS);
        cam.targetZoom = null;
      }
    });

    const release = (e) => {
      if (!pointers.delete(e.pointerId)) return;
      if (performance.now() - lastMoveAt > 80) { cam.spinVelocity = 0; cam.pitchVelocity = 0; }
      if (pointers.size > 0) return;

      const isTap = press && !press.moved && performance.now() - press.at < 500;
      press = null;
      pinchStart = null;
      if (!isTap) return;

      const photo = this.photoAt(e.clientX, e.clientY);
      if (photo !== null) {
        this.onPhotoTap(photo);
        return;
      }
      // toque duplo no vazio aproxima/afasta (para ler o coração)
      const now = performance.now();
      if (now - lastEmptyTapAt < 380) {
        cam.targetZoom = cam.zoom < 2 ? DOUBLE_TAP_ZOOM : 1;
        lastEmptyTapAt = 0;
      } else {
        lastEmptyTapAt = now;
      }
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      cam.zoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.001), ...ZOOM_LIMITS);
      cam.targetZoom = null;
    }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault()); // evita zoom da página no iOS
  }

  /** Índice da foto sob o dedo (a mais próxima da câmera primeiro) ou null. */
  photoAt(x, y) {
    const hit = this.hitAreas.find((area) => Math.hypot(x - area.x, y - area.y) < Math.max(area.radius * 1.15, 22));
    return hit ? hit.index : null;
  }

  updateCamera(dt) {
    const cam = this.camera;
    if (cam.targetZoom !== null) {
      cam.zoom += (cam.targetZoom - cam.zoom) * Math.min(1, dt * 5);
      if (Math.abs(cam.targetZoom - cam.zoom) < 0.01) { cam.zoom = cam.targetZoom; cam.targetZoom = null; }
    }
    if (this.activePointers.size > 0) return; // enquanto o dedo está na tela, quem gira é ela
    cam.yaw += (AUTO_SPIN + cam.spinVelocity) * dt;
    cam.pitch = clamp(cam.pitch + cam.pitchVelocity * dt, ...PITCH_LIMITS);
    const friction = 0.08 ** dt; // inércia depois de soltar o dedo
    cam.spinVelocity *= friction;
    cam.pitchVelocity *= friction;
  }

  /* ================= desenho ================= */

  frame(now) {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.time += dt;
    this.updateCamera(dt);
    this.galaxyRotation += dt * 0.035;

    const ctx = this.ctx;
    const cam = this.camera;
    const view = {
      focal: this.baseFocal * cam.zoom,
      cx: this.width / 2,
      cy: this.height * (this.height > this.width ? 0.5 : 0.53),
      cosYaw: Math.cos(cam.yaw), sinYaw: Math.sin(cam.yaw),
      cosPitch: Math.cos(cam.pitch), sinPitch: Math.sin(cam.pitch),
    };

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'lighter';

    this.drawStars(view);
    this.drawMeteors(dt);

    if (this.startTime !== null) {
      const t = (now - this.startTime) / 1000; // segundos desde a abertura
      this.drawNebulas(view, t);
      this.drawGalaxy(view, t);
      this.drawOrbits(view, t);

      const objects = this.collectObjects(view, t, dt);
      const behindHeart = objects.filter((o) => o.depth > CAMERA_DISTANCE);
      const inFront = objects.filter((o) => o.depth <= CAMERA_DISTANCE);
      behindHeart.forEach((o) => this.drawObject(o));
      this.drawHeart(view, t);
      inFront.forEach((o) => this.drawObject(o));

      // áreas de toque: a foto mais próxima da câmera vem primeiro
      this.hitAreas = objects.filter((o) => o.planet).reverse()
        .map((o) => ({ x: o.x, y: o.y, radius: o.radius, index: o.planet.index }));
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    requestAnimationFrame((next) => this.frame(next));
  }

  /** Projeta um ponto 3D (girado pela câmera e por `extraYaw`) na tela. */
  project(view, x, y, z, cosA = view.cosYaw, sinA = view.sinYaw) {
    const rx = x * cosA - z * sinA;
    const rz = x * sinA + z * cosA;
    const ry = y * view.cosPitch + rz * view.sinPitch;
    const depth = rz * view.cosPitch - y * view.sinPitch + CAMERA_DISTANCE;
    const scale = view.focal / depth;
    return { x: view.cx + rx * scale, y: view.cy - ry * scale, depth, scale };
  }

  drawStars(view) {
    const ctx = this.ctx;
    // giram mais devagar que o resto: dá sensação de profundidade
    const cosA = Math.cos(this.camera.yaw * 0.3);
    const sinA = Math.sin(this.camera.yaw * 0.3);
    for (let group = 0; group < 3; group++) {
      ctx.globalAlpha = 0.55 + 0.4 * Math.sin(this.time * (1.3 + group * 0.7) + group * 2);
      ctx.fillStyle = group === 1 ? '#ffd6f0' : '#ffffff';
      ctx.beginPath();
      for (const star of this.stars) {
        if (star.group !== group) continue;
        const rx = star.x * cosA - star.z * sinA;
        const rz = star.x * sinA + star.z * cosA;
        const ry = star.y * view.cosPitch + rz * view.sinPitch;
        const scale = (view.focal * 0.9) / (rz * view.cosPitch - star.y * view.sinPitch + 100);
        const px = view.cx + rx * scale;
        const py = view.cy - ry * scale;
        if (px < -2 || px > this.width + 2 || py < -2 || py > this.height + 2) continue;
        ctx.rect(px, py, star.size, star.size);
      }
      ctx.fill();
    }
  }

  drawMeteors(dt) {
    const ctx = this.ctx;
    this.nextMeteorIn -= dt;
    if (this.nextMeteorIn <= 0) {
      this.spawnMeteor();
      this.nextMeteorIn = random(4, 9);
    }
    ctx.lineCap = 'round';
    this.meteors = this.meteors.filter((m) => {
      m.life += dt;
      const progress = m.life / m.duration;
      if (progress >= 1) return false;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      const alpha = Math.sin(Math.PI * progress) * m.alpha; // aparece e some suavemente
      const tailX = m.x - m.vx * m.tail;
      const tailY = m.y - m.vy * m.tail;
      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gradient.addColorStop(0, m.headColor);
      gradient.addColorStop(0.25, m.tailColor);
      gradient.addColorStop(1, 'rgba(255,120,200,0)');
      ctx.strokeStyle = gradient;

      ctx.globalAlpha = alpha * 0.35; // rastro largo e fraco
      ctx.lineWidth = m.width * 3;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      ctx.globalAlpha = alpha; // núcleo fino
      ctx.lineWidth = m.width;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * m.tail * 0.7, m.y - m.vy * m.tail * 0.7); ctx.stroke();

      const head = m.width * 4.5;
      ctx.globalAlpha = alpha * 0.9;
      ctx.drawImage(this.sprites.glow, m.x - head, m.y - head, head * 2, head * 2);
      return true;
    });
  }

  galaxyAngles(view) {
    const angle = this.camera.yaw + this.galaxyRotation;
    return { cos: Math.cos(angle), sin: Math.sin(angle) };
  }

  drawNebulas(view, t) {
    const ctx = this.ctx;
    const { cos, sin } = this.galaxyAngles(view);
    const fadeIn = easeOutCubic(t / 3);
    for (const nebula of this.nebulas) {
      const p = this.project(view, nebula.x, nebula.y, nebula.z, cos, sin);
      if (p.depth < 2) continue;
      const size = nebula.size * p.scale;
      ctx.globalAlpha = nebula.alpha * fadeIn;
      ctx.drawImage(nebula.sprite, p.x - size, p.y - size, size * 2, size * 2);
    }
  }

  drawGalaxy(view, t) {
    const ctx = this.ctx;
    const g = this.galaxy;
    const { cos, sin } = this.galaxyAngles(view);
    const { cx, cy, focal, cosPitch, sinPitch } = view;

    GALAXY_COLORS.forEach((color, colorIndex) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = GALAXY_ALPHAS[colorIndex];
      ctx.beginPath();
      for (const i of g.byColor[colorIndex]) {
        // loop quente: conta feita à mão (sem criar objetos) para rodar liso no celular
        const e = easeOutCubic((t - g.delay[i]) / TIMELINE.galaxyDuration);
        let x = g.x[i];
        let y = g.y[i];
        let z = g.z[i];
        if (e < 1) {
          x = g.fromX[i] + (x - g.fromX[i]) * e;
          y = g.fromY[i] + (y - g.fromY[i]) * e;
          z = g.fromZ[i] + (z - g.fromZ[i]) * e;
        }
        const rx = x * cos - z * sin;
        const rz = x * sin + z * cos;
        const depth = rz * cosPitch - y * sinPitch + CAMERA_DISTANCE;
        if (depth < 1) continue;
        const scale = focal / depth;
        const size = clamp(g.size[i] * scale, 0.7, 3);
        ctx.rect(cx + rx * scale - size / 2, cy - (y * cosPitch + rz * sinPitch) * scale - size / 2, size, size);
      }
      ctx.fill();
    });
  }

  drawOrbits(view, t) {
    const ctx = this.ctx;
    ctx.globalAlpha = 0.2 * easeOutCubic((t - TIMELINE.photos) / 1.6);
    ctx.strokeStyle = '#ff9ad2';
    ctx.lineWidth = 1;
    for (const orbit of ORBITS) {
      const cosTilt = Math.cos(orbit.tilt);
      const sinTilt = Math.sin(orbit.tilt);
      ctx.beginPath();
      for (let step = 0; step <= 72; step++) {
        const a = (step / 72) * TAU;
        const flatZ = Math.sin(a) * orbit.radius;
        const p = this.project(view, Math.cos(a) * orbit.radius, flatZ * sinTilt, flatZ * cosTilt);
        if (step === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  /** Fotos e palavras com profundidade, ordenadas de trás para frente. */
  collectObjects(view, t, dt) {
    const objects = [];

    this.planets.forEach((planet, i) => {
      planet.angle += planet.speed * dt;
      if (!planet.thumb) return;
      const appear = easeOutCubic((t - TIMELINE.photos - i * 0.1) / 1.2);
      if (appear <= 0) return;
      const flatZ = Math.sin(planet.angle) * planet.radius;
      const bob = Math.sin(this.time * 0.8 + planet.bobPhase) * 0.15;
      const p = this.project(view,
        Math.cos(planet.angle) * planet.radius,
        flatZ * Math.sin(planet.tilt) + bob,
        flatZ * Math.cos(planet.tilt));
      if (p.depth < 2) return;
      objects.push({ planet, x: p.x, y: p.y, depth: p.depth, radius: PHOTO_RADIUS * p.scale * appear, alpha: appear });
    });

    this.floaters.forEach((floater, i) => {
      floater.angle += floater.speed * dt;
      const appear = easeOutCubic((t - TIMELINE.words - i * 0.08) / 1.5);
      if (appear <= 0) return;
      const p = this.project(view,
        Math.cos(floater.angle) * floater.radius,
        floater.y + Math.sin(this.time + floater.phase) * 0.2,
        Math.sin(floater.angle) * floater.radius);
      if (p.depth < 2) return;
      objects.push({ floater, x: p.x, y: p.y, depth: p.depth, scale: p.scale, alpha: appear });
    });

    return objects.sort((a, b) => b.depth - a.depth);
  }

  drawObject(o) {
    const ctx = this.ctx;
    if (o.planet) {
      const half = o.radius * (1 + (2 * THUMB_PADDING) / THUMB_SIZE);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = o.alpha * clamp(1.35 - (o.depth - CAMERA_DISTANCE) / 14, 0.55, 1);
      ctx.drawImage(o.planet.thumb, o.x - half, o.y - half, half * 2, half * 2);
    } else {
      const { sprite, height } = o.floater;
      const h = height * o.scale;
      const w = (h * sprite.width) / sprite.height;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = o.alpha * clamp(1.25 - (o.depth - CAMERA_DISTANCE) / 16, 0.35, 0.95);
      ctx.drawImage(sprite, o.x - w / 2, o.y - h / 2, w, h);
    }
  }

  drawHeart(view, t) {
    const ctx = this.ctx;
    const hp = this.heartParticles;
    const beat = heartbeat(this.time);
    const pulse = 1 + 0.05 * beat;
    const sway = Math.sin(this.time * 0.45) * 0.38; // balança de um lado pro outro
    const cosSway = Math.cos(sway);
    const sinSway = Math.sin(sway);
    // o coração fica sempre de frente, só um pouco inclinado com a câmera
    const cosTilt = Math.cos(this.camera.pitch * 0.15);
    const sinTilt = Math.sin(this.camera.pitch * 0.15);
    const { cos: gCos, sin: gSin } = this.galaxyAngles(view);
    const { cx, cy, focal } = view;
    const pixelsPerUnit = focal / CAMERA_DISTANCE;

    // brilho central (o "sol")
    ctx.globalCompositeOperation = 'lighter';
    const glowRadius = HEART_HEIGHT * 1.25 * pixelsPerUnit * (1 + 0.12 * beat);
    ctx.globalAlpha = (0.55 + 0.3 * beat) * easeOutCubic((t - TIMELINE.heartGlow) / 1.5);
    ctx.drawImage(this.sprites.glow, cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

    // partículas (menos fortes quando aproxima, para não cobrir as letras)
    HEART_PARTICLE_COLORS.forEach((color, colorIndex) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = (colorIndex === 0 ? 0.95 : 0.8) / Math.max(1, this.camera.zoom * 0.7);
      ctx.beginPath();
      for (const i of hp.byColor[colorIndex]) {
        const appear = easeOutCubic((t - TIMELINE.heartParticles - hp.delay[i]) / TIMELINE.heartParticlesDuration);
        if (appear <= 0) continue;
        const lx = hp.x[i] * pulse;
        const lz = hp.z[i] * pulse;
        let x = lx * cosSway + lz * sinSway;
        let y = hp.y[i] * pulse;
        let z = -lx * sinSway + lz * cosSway;
        if (appear < 1) { // vem da galáxia até o lugar
          const fromX = hp.fromX[i] * gCos - hp.fromZ[i] * gSin;
          const fromZ = hp.fromX[i] * gSin + hp.fromZ[i] * gCos;
          x = fromX + (x - fromX) * appear;
          y = hp.fromY[i] + (y - hp.fromY[i]) * appear;
          z = fromZ + (z - fromZ) * appear;
        }
        const scale = focal / (z * cosTilt - y * sinTilt + CAMERA_DISTANCE);
        const twinkle = 0.75 + 0.45 * Math.sin(this.time * 3 + hp.phase[i]);
        const size = clamp(hp.size[i] * scale * twinkle, 0.6, 2.4);
        ctx.rect(cx + x * scale - size / 2, cy - (y * cosTilt + z * sinTilt) * scale - size / 2, size, size);
      }
      ctx.fill();
    });

    // textura com "eu te amo" em várias línguas
    const textAlpha = easeOutCubic((t - TIMELINE.heartText) / 1.6);
    if (textAlpha <= 0) return;
    const { canvas: texture, heightRatio } = this.heartTexture;
    const height = HEART_HEIGHT * pixelsPerUnit * pulse * heightRatio;
    const width = (height * texture.width) / texture.height;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(Math.max(Math.abs(cosSway), 0.05), cosTilt);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.93 * textAlpha;
    ctx.drawImage(texture, -width / 2, -height / 2, width, height);
    ctx.globalCompositeOperation = 'lighter'; // brilha um pouco a cada batida
    ctx.globalAlpha = 0.18 * beat * textAlpha;
    ctx.drawImage(texture, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
}
