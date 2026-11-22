/**
 * O coração do centro: o formato (curva clássica), a textura com
 * "eu te amo" em várias línguas e as partículas brilhantes em volta.
 */
import { TAU, random, gaussian, createCanvas } from './utils.js';

const heartX = (t) => 16 * Math.sin(t) ** 3;
const heartY = (t) => 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

/** Limites verticais da curva, para centralizar o coração. */
const HEART_BOUNDS = (() => {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < 2000; i++) {
    const y = heartY((i / 2000) * TAU);
    min = Math.min(min, y);
    max = Math.max(max, y);
  }
  return { min, max, center: (min + max) / 2, height: max - min };
})();

const TEXTURE_HEIGHT = 1400; // alta resolução para ler as letrinhas ao aproximar
const TEXTURE_MARGIN = 30;
const ROW_COLORS = ['#fff3fa', '#ffb3da', '#ff7ac0'];

/**
 * Desenha o coração preenchido com as frases.
 * Retorna o canvas e a proporção entre a altura total e a altura do coração.
 */
export function createHeartTexture(phrases) {
  const scale = (TEXTURE_HEIGHT - 2 * TEXTURE_MARGIN) / HEART_BOUNDS.height;
  const width = Math.ceil(32 * scale + 2 * TEXTURE_MARGIN);
  const canvas = createCanvas(width, TEXTURE_HEIGHT);
  const g = canvas.getContext('2d');

  const tracePath = () => {
    g.beginPath();
    for (let i = 0; i <= 400; i++) {
      const t = (i / 400) * TAU;
      const x = width / 2 + heartX(t) * scale;
      const y = TEXTURE_HEIGHT / 2 - (heartY(t) - HEART_BOUNDS.center) * scale;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  };

  g.save();
  tracePath();
  g.clip();

  const background = g.createRadialGradient(width / 2, TEXTURE_HEIGHT * 0.45, 10, width / 2, TEXTURE_HEIGHT / 2, width * 0.6);
  background.addColorStop(0, 'rgba(255,130,200,.42)');
  background.addColorStop(1, 'rgba(255,40,140,.16)');
  g.fillStyle = background;
  g.fillRect(0, 0, width, TEXTURE_HEIGHT);

  const fontSize = 19;
  const lineHeight = 25;
  const separator = '  ♥  ';
  g.font = `italic 600 ${fontSize}px Georgia, "Times New Roman", serif`;
  g.textBaseline = 'middle';
  g.direction = 'ltr';
  g.shadowColor = '#ff2d8f';
  g.shadowBlur = 4;

  let row = 0;
  for (let y = TEXTURE_MARGIN + lineHeight / 2; y < TEXTURE_HEIGHT; y += lineHeight, row++) {
    g.fillStyle = ROW_COLORS[row % ROW_COLORS.length];
    let x = -((row * 41) % 90);
    let index = (row * 7) % phrases.length;
    // cada frase é desenhada separada para não misturar línguas da direita para a esquerda
    while (x < width) {
      const phrase = phrases[index % phrases.length];
      g.fillText(phrase, x, y);
      x += g.measureText(phrase).width;
      g.fillText(separator, x, y);
      x += g.measureText(separator).width;
      index++;
    }
  }
  g.restore();

  // contorno brilhante
  g.shadowColor = '#ff4fa3';
  g.shadowBlur = 26;
  g.lineWidth = 8;
  g.strokeStyle = 'rgba(255,190,225,.95)';
  tracePath();
  g.stroke();

  return { canvas, heightRatio: TEXTURE_HEIGHT / (TEXTURE_HEIGHT - 2 * TEXTURE_MARGIN) };
}

export const HEART_PARTICLE_COLORS = ['#ffffff', '#ff8cc8', '#ffc2e0'];

/**
 * Partículas do coração. Cada uma tem a posição final (x, y, z),
 * a posição de onde vem durante a abertura (fromX/Y/Z) e um atraso.
 */
export function createHeartParticles(count, heartHeight) {
  const unit = heartHeight / HEART_BOUNDS.height;
  const particles = {
    x: new Float32Array(count), y: new Float32Array(count), z: new Float32Array(count),
    size: new Float32Array(count), phase: new Float32Array(count), delay: new Float32Array(count),
    fromX: new Float32Array(count), fromY: new Float32Array(count), fromZ: new Float32Array(count),
    byColor: HEART_PARTICLE_COLORS.map(() => []),
  };

  for (let i = 0; i < count; i++) {
    const t = random(0, TAU);
    const onOutline = i % 20 < 11; // ~55% no contorno, o resto preenche o volume
    const spread = onOutline ? 1 + gaussian() * 0.04 : Math.sqrt(Math.random()) * 0.96;
    const depth = onOutline ? gaussian() * 0.25 : gaussian() * 0.9 * (1 - spread * spread);

    particles.x[i] = heartX(t) * spread * unit;
    particles.y[i] = (heartY(t) - HEART_BOUNDS.center) * spread * unit;
    particles.z[i] = depth;
    particles.size[i] = random(0.03, 0.075);
    particles.phase[i] = random(0, TAU);
    particles.delay[i] = Math.random() * 0.8;

    const angle = random(0, TAU);
    const distance = random(1.5, 9);
    particles.fromX[i] = Math.cos(angle) * distance;
    particles.fromY[i] = gaussian() * 0.4;
    particles.fromZ[i] = Math.sin(angle) * distance;

    particles.byColor[i % HEART_PARTICLE_COLORS.length].push(i);
  }
  return particles;
}

/** Batida dupla do coração (tum-tum), entre 0 e ~1. */
export function heartbeat(time) {
  const p = time % 1.15;
  return Math.exp(-(((p - 0.1) / 0.055) ** 2)) + 0.6 * Math.exp(-(((p - 0.33) / 0.07) ** 2));
}
