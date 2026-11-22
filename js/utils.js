/** Funções pequenas usadas em todo o projeto. */

export const TAU = Math.PI * 2;

export const $ = (id) => document.getElementById(id);

export const random = (min, max) => min + Math.random() * (max - min);

/** Número aleatório com distribuição aproximadamente normal, entre -1 e 1. */
export const gaussian = () =>
  (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Suaviza animações: começa rápido e desacelera (0 → 1). */
export const easeOutCubic = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

export const pad2 = (n) => String(n).padStart(2, '0');

export function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Ativa as ferramentas de teste só quando a URL tem ?debug. */
export const DEBUG = new URLSearchParams(window.location.search).has('debug');
