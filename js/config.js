/**
 * Conteúdo do site — tudo o que é texto, foto ou data fica aqui.
 * Para mudar uma frase, a carta ou a data, edite só este arquivo.
 */

/** Data e hora em que vocês começaram (mês começa em 0: outubro = 9). */
export const START_DATE = new Date(2026, 9, 3, 12, 0, 0);

/**
 * Fotos que giram em volta do coração.
 * - focus: [x, y, zoom] do recorte redondo (0–1); ajuda a centralizar os rostos.
 * - quote / source: frase mostrada quando a foto é aberta.
 */
export const PHOTOS = [
  {
    src: 'assets/fotos/foto-01.jpg', focus: [0.45, 0.47, 0.62],
    quote: '“Meu Deus! Um momento inteiro de felicidade! Será isso pouco, mesmo para a vida inteira de um homem?”',
    source: 'Fiódor Dostoiévski · Noites Brancas',
  },
  {
    src: 'assets/fotos/foto-02.jpg', focus: [0.5, 0.42, 0.92],
    quote: '“Amar outra pessoa é ver a face de Deus.”',
    source: 'Victor Hugo · Os Miseráveis',
  },
  {
    src: 'assets/fotos/foto-03.jpg', focus: [0.42, 0.6, 0.58],
    quote: '“Tu és toda formosa, amiga minha, e em ti não há mancha.”',
    source: 'Cantares 4:7',
  },
  {
    src: 'assets/fotos/foto-04.jpg', focus: [0.5, 0.55, 0.95],
    quote: '“Amai para entendê-las! Pois só quem ama pode ter ouvido capaz de ouvir e de entender estrelas.”',
    source: 'Olavo Bilac',
  },
  {
    src: 'assets/fotos/foto-05.jpg', focus: [0.56, 0.42, 0.7],
    quote: '“Amor é fogo que arde sem se ver; é ferida que dói, e não se sente.”',
    source: 'Luís de Camões',
  },
  {
    src: 'assets/fotos/foto-06.jpg', focus: [0.5, 0.5, 1],
    quote: '“Eis que és formosa, ó amiga minha, eis que és formosa; os teus olhos são como os das pombas.”',
    source: 'Cantares 1:15',
  },
  {
    src: 'assets/fotos/foto-07.jpg', focus: [0.48, 0.44, 0.5],
    quote: '“Foi o tempo que dedicaste à tua rosa que fez a tua rosa tão importante.”',
    source: 'Antoine de Saint-Exupéry · O Pequeno Príncipe',
  },
  {
    src: 'assets/fotos/foto-08.jpg', focus: [0.42, 0.45, 0.95],
    quote: '“O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.”',
    source: '1 Coríntios 13:4',
  },
  {
    src: 'assets/fotos/foto-09.jpg', focus: [0.6, 0.55, 0.9],
    quote: '“Aonde quer que tu fores irei eu, e onde quer que pousares, ali pousarei eu.”',
    source: 'Rute 1:16',
  },
  {
    src: 'assets/fotos/foto-10.jpg', focus: [0.5, 0.5, 1],
    quote: '“Do que quer que nossas almas sejam feitas, a sua e a minha são iguais.”',
    source: 'Emily Brontë · O Morro dos Ventos Uivantes',
  },
  {
    src: 'assets/fotos/foto-11.jpg', focus: [0.46, 0.42, 0.66],
    quote: '“Põe-me como selo sobre o teu coração, como selo sobre o teu braço, porque o amor é forte como a morte.”',
    source: 'Cantares 8:6',
  },
  {
    src: 'assets/fotos/foto-12.jpg', focus: [0.5, 0.4, 0.95],
    quote: '“Só se vê bem com o coração. O essencial é invisível aos olhos.”',
    source: 'Antoine de Saint-Exupéry · O Pequeno Príncipe',
  },
  {
    src: 'assets/fotos/foto-13.jpg', focus: [0.5, 0.37, 0.55],
    quote: '“Muitas filhas agiram virtuosamente, mas tu a todas és superior.”',
    source: 'Provérbios 31:29',
  },
  {
    src: 'assets/fotos/foto-14.jpg', focus: [0.49, 0.4, 0.66],
    quote: '“Meu amor é tão profundo quanto o mar: quanto mais te dou, mais tenho, pois ambos são infinitos.”',
    source: 'William Shakespeare · Romeu e Julieta',
  },
  {
    src: 'assets/fotos/foto-15.jpg', focus: [0.45, 0.42, 0.95],
    quote: '“As muitas águas não poderiam apagar este amor, nem os rios afogá-lo.”',
    source: 'Cantares 8:7',
  },
  {
    src: 'assets/fotos/foto-16.jpg', focus: [0.56, 0.3, 0.62],
    quote: '“A beleza salvará o mundo.”',
    source: 'Fiódor Dostoiévski · O Idiota',
  },
];

/** Carta que se escreve letra por letra. */
export const LETTER = [
  'Menina lua,',
  'Não teve um dia, desde que te conheci, em que eu não tenha me apaixonado por você. ' +
    'É como se cada dia você me desse mais de 100 motivos para me apaixonar ainda mais por você.',
  'Eu não quero outra risada, eu não quero outro corpo, outra boca, outro abraço. Eu quero você e só você.',
  'Em meu coração só cabe você. Ele só pertence a você.',
  'Eu te amo. ❤️',
].join('\n\n');

/** "Eu te amo" em várias línguas — preenchem o coração do centro. */
export const LOVE_PHRASES = [
  'Eu te amo', 'I love you', 'Te amo', "Je t'aime", 'Ti amo', 'Ich liebe dich', 'Ik hou van jou',
  'Jeg elsker deg', 'Jag älskar dig', 'Kocham cię', 'Miluji tě', 'Seni seviyorum', 'Σ’ αγαπώ',
  'Я тебя люблю', 'Te iubesc', 'Szeretlek', '我爱你', '愛してる', '사랑해', 'أحبك', 'אני אוהב אותך',
  'मैं तुमसे प्यार करता हूँ', 'Mahal kita', 'Aku cinta kamu', 'Anh yêu em', 'Nakupenda',
  'Mina armastan sind', 'Rakastan sinua', "T'estimo", 'Maite zaitut', 'Aloha au iā ʻoe', 'Ég elska þig',
];

/** Palavras e emojis que flutuam pelo universo. */
export const FLOATING_WORDS = [
  'I love you', 'menina lua', 'Te amo', 'Meu amor', 'Minha vida', 'Você é única', 'Pra sempre',
  'Minha paz', 'Meu universo', 'I love you', 'menina lua', 'Linda', 'Meu mundo', 'Só nós dois',
];
export const FLOATING_EMOJIS = ['💖', '🌙', '💕', '✨', '💗', '🌙', '💞', '⭐', '💖', '🌙'];

/** Corações que sobem quando uma foto é aberta. */
export const RISING_HEARTS = ['❤️', '💖', '💕', '💗', '💞', '✨'];

/**
 * Música de fundo (Lisboa), em loop. O arquivo já vem gravado baixinho (iPhone ignora o volume), por isso volume: 1. Com src: null toca uma melodia calma gerada no navegador.
 * O script de build embute esta música no arquivo único (veja o README).
 */
export const MUSIC = { src: 'assets/musica/lisboa.m4a', volume: 1 };
