# Para Você, Menina Lua 🌙

Um universo animado com um coração no centro, escrito com "eu te amo" em 32 línguas,
e as nossas fotos girando em volta como planetas.

**Site:** https://marceloceliamatheus-blip.github.io/meninalua/

## O que tem

- Galáxia que se forma ao abrir, estrelas cadentes discretas no fundo
- Coração com "eu te amo" em várias línguas (toque duas vezes para ler de perto)
- 16 fotos em órbita; ao tocar, abre a foto com um versículo ou uma frase de livro
- Carta que se escreve letra por letra
- Contador "juntos desde 03/10/2026"
- Música baixinha em loop com botão de pausar

## Estrutura

```
index.html                  marcação da página
css/style.css               estilos
js/config.js                ✏️ CONTEÚDO: fotos, frases, carta, data, música
js/main.js                  liga tudo
js/scene.js                 o universo em canvas (câmera, galáxia, fotos, coração)
js/heart.js                 formato, textura e partículas do coração
js/sprites.js               imagens desenhadas uma vez (brilhos, textos, fotos redondas)
js/ui.js                    foto aberta, carta, contador, botões
js/music.js                 música de fundo
js/utils.js                 funções pequenas
assets/fotos/               as fotos
scripts/build_single_file.py  gera o arquivo único para o WhatsApp
```

## Como editar

Quase tudo se muda em **`js/config.js`**:

- **Frase de uma foto:** campos `quote` e `source` da foto.
- **Enquadramento do rosto na bolinha:** `focus: [x, y, zoom]` (valores de 0 a 1).
- **Carta:** `LETTER`.
- **Data do contador:** `START_DATE` (o mês começa em 0 — outubro é 9).
- **Trocar uma foto:** substitua o arquivo em `assets/fotos/` mantendo o nome.

## Rodar no computador

Os módulos JavaScript precisam de um servidor (abrir o `index.html` direto não funciona):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Adicione `?debug` na URL para liberar as ferramentas de teste (`window.__debug`).

## Arquivo único para o WhatsApp

```bash
python3 scripts/build_single_file.py                      # sem música (melodia calma)
python3 scripts/build_single_file.py --musica musica.m4a  # com a música em loop
```

O arquivo sai em `dist/para-voce-menina-lua.html`. A pasta `dist/` e arquivos de áudio
não vão para o GitHub (veja `.gitignore`) — músicas com direitos autorais não devem ser
publicadas no site.

## Publicação

O GitHub Pages publica a branch `main` direto da raiz (Settings → Pages → Deploy from a branch).
