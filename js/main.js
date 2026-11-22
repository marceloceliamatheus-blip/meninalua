/**
 * Ponto de entrada: junta o conteúdo (config.js) com o universo,
 * a interface e a música.
 */
import {
  START_DATE, PHOTOS, LETTER, LOVE_PHRASES, FLOATING_WORDS, FLOATING_EMOJIS, RISING_HEARTS, MUSIC,
} from './config.js';
import { $, DEBUG } from './utils.js';
import { Universe } from './scene.js';
import { BackgroundMusic } from './music.js';
import { PhotoViewer, LoveLetter, startTogetherCounter, bindMusicButton, revealInterfaceOverTime } from './ui.js';

const viewer = new PhotoViewer(PHOTOS, RISING_HEARTS);
const letter = new LoveLetter(LETTER);
const music = new BackgroundMusic(MUSIC);

const universe = new Universe($('universe'), {
  photos: PHOTOS,
  lovePhrases: LOVE_PHRASES,
  floatingWords: FLOATING_WORDS,
  floatingEmojis: FLOATING_EMOJIS,
  onPhotoTap: (index) => viewer.open(index),
});

startTogetherCounter(START_DATE);
bindMusicButton(music);
$('letter-open').addEventListener('click', () => letter.open());

$('intro-start').addEventListener('click', () => {
  $('intro').classList.add('is-hidden');
  music.start(); // precisa vir de um toque
  universe.start();
  revealInterfaceOverTime();
}, { once: true });

// Ferramentas para testes automáticos: só existem com ?debug na URL.
if (DEBUG) {
  window.__debug = {
    openPhoto: (i) => viewer.open(i),
    closePhoto: () => viewer.close(),
    openLetter: () => letter.open(),
    spawnMeteors: () => { universe.spawnMeteor(true); universe.spawnMeteor(false); },
    get hitAreas() { return universe.hitAreas; },
    get thumbsReady() { return universe.planets.filter((p) => p.thumb).length; },
    get meteors() { return universe.meteors.length; },
    get music() { return music.state; },
  };
}
