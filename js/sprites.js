/**
 * Imagens desenhadas uma única vez em canvas e reaproveitadas a cada quadro
 * (brilhos, textos, emojis e as fotos redondas).
 */
import { TAU, clamp, createCanvas } from './utils.js';

const SERIF = 'Georgia, "Times New Roman", serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/** Círculo com degradê radial. stops: [[posição 0–1, cor], ...] */
export function createGlowSprite(radius, stops) {
  const canvas = createCanvas(radius * 2, radius * 2);
  const g = canvas.getContext('2d');
  const gradient = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  g.fillStyle = gradient;
  g.fillRect(0, 0, radius * 2, radius * 2);
  return canvas;
}

export function createTextSprite(text, size, color) {
  const font = `italic 600 ${size}px ${SERIF}`;
  const measure = createCanvas(1, 1).getContext('2d');
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width) + size;
  const height = Math.ceil(size * 1.7);

  const canvas = createCanvas(width, height);
  const g = canvas.getContext('2d');
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.shadowColor = '#ff2d8f';
  g.shadowBlur = size * 0.45;
  g.fillText(text, width / 2, height / 2);
  g.shadowBlur = 0;
  g.fillText(text, width / 2, height / 2);
  return canvas;
}

export function createEmojiSprite(emoji) {
  const canvas = createCanvas(64, 64);
  const g = canvas.getContext('2d');
  g.font = `44px ${EMOJI_FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(emoji, 32, 35);
  return canvas;
}

export const THUMB_SIZE = 200;
export const THUMB_PADDING = 18;

/** Recorta a foto em círculo com borda rosa brilhante. focus = [x, y, zoom]. */
export function createPhotoThumb(image, [focusX, focusY, zoom]) {
  const radius = THUMB_SIZE / 2;
  const center = radius + THUMB_PADDING;
  const canvas = createCanvas(THUMB_SIZE + THUMB_PADDING * 2, THUMB_SIZE + THUMB_PADDING * 2);
  const g = canvas.getContext('2d');

  // brilho atrás do círculo
  g.shadowColor = '#ff4fa3';
  g.shadowBlur = 18;
  g.fillStyle = '#ff9fd0';
  g.beginPath();
  g.arc(center, center, radius, 0, TAU);
  g.fill();
  g.shadowBlur = 0;

  // foto recortada no ponto de foco
  g.save();
  g.beginPath();
  g.arc(center, center, radius - 3, 0, TAU);
  g.clip();
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const side = Math.min(w, h) * zoom;
  const sx = clamp(focusX * w - side / 2, 0, w - side);
  const sy = clamp(focusY * h - side / 2, 0, h - side);
  g.drawImage(image, sx, sy, side, side, center - radius, center - radius, THUMB_SIZE, THUMB_SIZE);

  // leve reflexo para parecer um "planeta"
  const shine = g.createLinearGradient(0, center - radius, 0, center + radius);
  shine.addColorStop(0, 'rgba(255,255,255,.12)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0)');
  shine.addColorStop(1, 'rgba(60,0,40,.25)');
  g.fillStyle = shine;
  g.fillRect(center - radius, center - radius, THUMB_SIZE, THUMB_SIZE);
  g.restore();

  // borda
  g.lineWidth = 5;
  g.strokeStyle = 'rgba(255,225,240,.95)';
  g.beginPath();
  g.arc(center, center, radius - 2, 0, TAU);
  g.stroke();
  return canvas;
}
