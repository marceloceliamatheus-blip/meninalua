/**
 * Partes em HTML por cima do universo: foto aberta, carta,
 * contador e botões.
 */
import { $, random, pad2 } from './utils.js';

/** Evita que o mesmo toque que abriu uma janela já a feche. */
const OPEN_GUARD_MS = 450;
const SWIPE_DISTANCE = 50;

/* ---------------- foto aberta ---------------- */

export class PhotoViewer {
  constructor(photos, risingHearts) {
    this.photos = photos;
    this.risingHearts = risingHearts;
    this.index = 0;
    this.openedAt = 0;
    this.heartTimer = null;
    this.el = {
      root: $('viewer'), hearts: $('viewer-hearts'), image: $('viewer-image'),
      quote: $('viewer-quote'), source: $('viewer-source'),
    };
    this.bindEvents();
  }

  bindEvents() {
    const { root } = this.el;
    $('viewer-prev').addEventListener('click', () => this.show(this.index - 1));
    $('viewer-next').addEventListener('click', () => this.show(this.index + 1));
    $('viewer-close').addEventListener('click', () => this.close());
    root.addEventListener('click', (e) => {
      if (performance.now() - this.openedAt < OPEN_GUARD_MS) return;
      if (e.target.closest('.viewer__frame, .viewer__nav, .viewer__close')) return;
      this.close();
    });

    let touchStartX = null;
    root.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > SWIPE_DISTANCE) {
        this.openedAt = performance.now();
        this.show(this.index + (dx < 0 ? 1 : -1));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight') this.show(this.index + 1);
      if (e.key === 'ArrowLeft') this.show(this.index - 1);
    });
  }

  get isOpen() {
    return this.el.root.classList.contains('is-open');
  }

  open(index) {
    this.show(index);
    this.openedAt = performance.now();
    this.el.root.classList.add('is-open');
    this.el.root.setAttribute('aria-hidden', 'false');
    this.heartTimer ??= setInterval(() => this.spawnHeart(), 320);
  }

  close() {
    this.el.root.classList.remove('is-open');
    this.el.root.setAttribute('aria-hidden', 'true');
    clearInterval(this.heartTimer);
    this.heartTimer = null;
    setTimeout(() => { if (!this.isOpen) this.el.hearts.replaceChildren(); }, OPEN_GUARD_MS);
  }

  show(index) {
    const total = this.photos.length;
    this.index = (index + total) % total;
    const photo = this.photos[this.index];
    this.el.image.src = photo.src;
    this.el.image.alt = `Foto ${this.index + 1} de ${total}`;
    this.el.quote.textContent = photo.quote;
    // autor numa linha, livro na outra
    this.el.source.textContent = `— ${photo.source.replace(' · ', '\n')}`;
    for (let k = 0; k < 8; k++) setTimeout(() => this.spawnHeart(), k * 90);
  }

  spawnHeart() {
    const heart = document.createElement('span');
    heart.textContent = this.risingHearts[Math.floor(Math.random() * this.risingHearts.length)];
    heart.style.left = `${random(2, 94)}%`;
    heart.style.fontSize = `${random(14, 30)}px`;
    heart.style.animationDuration = `${random(4, 7.5)}s`;
    heart.addEventListener('animationend', () => heart.remove());
    this.el.hearts.appendChild(heart);
  }
}

/* ---------------- carta ---------------- */

const TYPING_INTERVAL_MS = 38;

export class LoveLetter {
  constructor(text) {
    this.characters = Array.from(text); // Array.from não quebra emojis
    this.typingTimer = null;
    this.openedAt = 0;
    this.el = { root: $('letter'), text: $('letter-text'), skip: $('letter-skip') };

    $('letter-close').addEventListener('click', () => this.close());
    this.el.root.addEventListener('click', (e) => {
      if (performance.now() - this.openedAt < OPEN_GUARD_MS) return;
      const onPaper = e.target.closest('.letter__paper');
      if (onPaper && this.typingTimer) this.finishTyping(); // toque na carta mostra tudo
      else if (!onPaper) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.el.root.classList.contains('is-open')) this.close();
    });
  }

  open() {
    const { root, text, skip } = this.el;
    root.classList.remove('is-done');
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    skip.hidden = false;
    text.textContent = '';
    this.openedAt = performance.now();

    let shown = 0;
    clearInterval(this.typingTimer);
    this.typingTimer = setInterval(() => {
      shown++;
      text.textContent = this.characters.slice(0, shown).join('');
      if (shown >= this.characters.length) this.finishTyping();
    }, TYPING_INTERVAL_MS);
  }

  finishTyping() {
    clearInterval(this.typingTimer);
    this.typingTimer = null;
    this.el.text.textContent = this.characters.join('');
    this.el.root.classList.add('is-done');
    this.el.skip.hidden = true;
  }

  close() {
    this.el.root.classList.remove('is-open');
    this.el.root.setAttribute('aria-hidden', 'true');
  }
}

/* ---------------- contador ---------------- */

export function startTogetherCounter(startDate) {
  const date = startDate.toLocaleDateString('pt-BR');
  $('counter-label').textContent = `juntos desde ${date} 💞`;
  const output = $('counter-value');

  const update = () => {
    const totalSeconds = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    output.textContent = `${days} ${days === 1 ? 'dia' : 'dias'} · ${pad2(hours)}h ${pad2(minutes)}min ${pad2(seconds)}s`;
  };
  update();
  setInterval(update, 1000);
}

/* ---------------- botão de música ---------------- */

export function bindMusicButton(music) {
  const button = $('music-toggle');
  button.addEventListener('click', () => {
    const playing = music.toggle();
    button.textContent = playing ? '♫' : '🔇';
    button.classList.toggle('is-off', !playing);
    button.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
  });
}

/* ---------------- sequência de abertura ---------------- */

/** Mostra cada elemento da interface no seu tempo (ms após a abertura). */
export function revealInterfaceOverTime() {
  const steps = [
    [5200, () => ['title', 'counter', 'music-toggle'].forEach((id) => $(id).classList.add('is-visible'))],
    [6200, () => $('hint').classList.add('is-visible')],
    [16000, () => $('hint').classList.remove('is-visible')],
    [17500, () => $('letter-open').classList.add('is-visible')],
  ];
  steps.forEach(([delay, action]) => setTimeout(action, delay));
}
