#!/usr/bin/env python3
"""
Gera um único arquivo .html com tudo embutido (CSS, JavaScript, fotos e,
opcionalmente, a música) — o formato que dá para mandar pelo WhatsApp.

Uso:
    python3 scripts/build_single_file.py
    python3 scripts/build_single_file.py --musica caminho/da/musica.m4a
    python3 scripts/build_single_file.py --saida dist/outro-nome.html
"""
import argparse
import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Ordem das dependências: cada módulo só usa o que vem antes dele.
MODULES = ['config', 'utils', 'sprites', 'heart', 'scene', 'music', 'ui', 'main']

IMPORT_RE = re.compile(r"^import\s[\s\S]*?from\s+'[^']+';[ \t]*\n", re.MULTILINE)
EXPORT_RE = re.compile(r'^export\s+', re.MULTILINE)
PHOTO_RE = re.compile(r"'(assets/fotos/[^']+)'")
MUSIC_RE = re.compile(r'MUSIC = \{ src: null,')


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    if path.suffix.lower() == '.m4a':
        mime = 'audio/mp4'
    return f'data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}'


def bundle_javascript(music_path: Path | None) -> str:
    parts = []
    for name in MODULES:
        source = (ROOT / 'js' / f'{name}.js').read_text(encoding='utf-8')
        source = IMPORT_RE.sub('', source)
        source = EXPORT_RE.sub('', source)
        parts.append(f'/* ---- {name}.js ---- */\n{source}')
    code = '\n'.join(parts)

    def inline_photo(match: re.Match) -> str:
        photo = ROOT / match.group(1)
        if not photo.exists():
            sys.exit(f'Foto não encontrada: {photo}')
        return f"'{data_uri(photo)}'"

    code = PHOTO_RE.sub(inline_photo, code)

    if music_path:
        if not music_path.exists():
            sys.exit(f'Música não encontrada: {music_path}')
        code, replaced = MUSIC_RE.subn(f"MUSIC = {{ src: '{data_uri(music_path)}',", code)
        if replaced != 1:
            sys.exit('Não achei a configuração MUSIC em config.js.')

    return f"(() => {{\n'use strict';\n{code}\n}})();"


def build(output: Path, music_path: Path | None) -> None:
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'css' / 'style.css').read_text(encoding='utf-8')

    html = html.replace('<link rel="stylesheet" href="css/style.css">', f'<style>\n{css}</style>')
    html = html.replace('  <script type="module" src="js/main.js"></script>\n', '')
    # script comum (não módulo) precisa rodar depois que o HTML existir
    html = html.replace('</body>', f'<script>\n{bundle_javascript(music_path)}\n</script>\n</body>')

    for leftover in ('css/style.css', 'js/main.js', 'assets/fotos/'):
        if leftover in html:
            sys.exit(f'Ficou uma referência externa no arquivo final: {leftover}')

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding='utf-8')
    size_mb = output.stat().st_size / 1_000_000
    print(f'Gerado {output.relative_to(ROOT) if output.is_relative_to(ROOT) else output} ({size_mb:.1f} MB)'
          f'{" com música" if music_path else ""}')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--musica', type=Path, help='arquivo de áudio (.m4a ou .mp3) para tocar em loop')
    parser.add_argument('--saida', type=Path, default=ROOT / 'dist' / 'para-voce-menina-lua.html')
    args = parser.parse_args()
    build(args.saida.resolve(), args.musica.resolve() if args.musica else None)


if __name__ == '__main__':
    main()
