#!/usr/bin/env bash
# Buduje statyczne wersje narzędzi dla firm do public/narzedzia/{kpir,jpk}.
# Źródła: repo exhuman777/przeglad-kpir-szablon i exhuman777/przeglad-2027 (prywatne).
# Użycie: scripts/narzedzia/zbuduj.sh <ścieżka przeglad-kpir-szablon> <ścieżka przeglad-2027>
# Wersja WZD: bez panelu, API, czatu i formularzy biura; pliki czyta tylko przeglądarka.
set -euo pipefail
KPIR_SRC="$(cd "$1" && pwd)"; JPK_SRC="$(cd "$2" && pwd)"
WZD="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
CEL="$WZD/public/narzedzia"

statyczny_config() {
  cat > "$1/astro.config.mjs" <<'CFG'
import { defineConfig } from 'astro/config';
// Wersja dla wezmezadarmo.com: sam statyczny HTML, bez funkcji serwera.
export default defineConfig({
  site: 'https://www.wezmezadarmo.com',
  output: 'static',
  build: { format: 'directory' },
  vite: { build: { assetsInlineLimit: 0 } },
  devToolbar: { enabled: false },
});
CFG
}

# ---------- Przegląd KPiR
kopiuj() { mkdir -p "$2"; tar -C "$1" --exclude=.git --exclude=node_modules --exclude=dist -cf - . | tar -C "$2" -xf -; }
kopiuj "$KPIR_SRC" "$TMP/kpir"
cd "$TMP/kpir"
rm -rf src/pages/api src/pages/panel-0000000000 src/pages/zaplacone.astro src/pages/radar src/pages/pelna src/pages/dlaczego src/pages/robots.txt.js src/pages/wersja.json.js src/pages/polityka-prywatnosci.astro
statyczny_config "$TMP/kpir"
sed -i 's#<h2>Wgraj księgę klienta</h2>#<h2>Wgraj księgę</h2>#' src/components/ModulKpir.astro
node -e "
const c=require('./src/content.example.json');
c.firma={...c.firma,nazwa:'wezmezadarmo.com',pelna:'wezmezadarmo.com',www:'https://www.wezmezadarmo.com'};
c.marka={...c.marka,akcent:'#b5402f',ciemny:'#2b2420',jasny:'#f6f0e4',font:'inter'};
c.tryb={dlaKlientow:false,pokazowa:false};
c.teksty={...c.teksty,lead:'Wgraj swoją księgę przychodów i rozchodów. Zobaczysz kondycję firmy, wpisy do sprawdzenia przed wysyłką JPK_PKPIR i porównanie form opodatkowania.',stopka:'Przygotowano na wezmezadarmo.com. Werdykt w sprawach podatkowych daje księgowa.'};
c.formularz={...c.formularz,tytul:'Omówienie z księgową',lead:'Wynik omów ze swoją księgową.',dziekujemy:'Dziękujemy.'};
c.czat={...c.czat,on:false};
c.moduly=[{id:'kpir',on:true,sekcje:[{id:'omowienie',on:false},{id:'doginvoice',on:false}]},{id:'forma',on:true},{id:'pelna',on:false},{id:'radar',on:false},{id:'dlaczego',on:false},{id:'platnosci',on:false}];
require('fs').writeFileSync('src/content.json',JSON.stringify(c,null,1));
"
npm ci --no-audit --no-fund >/dev/null
npm run dane >/dev/null
node scripts/przygotuj.mjs >/dev/null
npx astro build >/dev/null
# tylko używany krój (inter)
find dist/fonty -type f ! -name 'inter-*' -delete
node "$WZD/scripts/narzedzia/przepisz-sciezki.mjs" dist /narzedzia/kpir
grep -rl '/narzedzia/kpir/polityka-prywatnosci/' dist | xargs -r sed -i 's#/narzedzia/kpir/polityka-prywatnosci/#/polityka-prywatnosci#g'
rm -rf "$CEL/kpir"; mkdir -p "$CEL"; cp -r dist "$CEL/kpir"

# ---------- Przegląd JPK_V7 przed 2027
kopiuj "$JPK_SRC" "$TMP/jpk"
cd "$TMP/jpk"
rm -rf src/pages/api src/pages/b src/pages/robots.txt.js
statyczny_config "$TMP/jpk"
python3 - <<'PY'
import re
p='src/components/Strona.astro'; s=open(p,encoding='utf-8').read()
def must(a,b):
    global s
    assert a in s, a[:60]
    s=s.replace(a,b,1)
must('<a class="btn btn-g" href="#oko">Drugie oko księgowej</a>','')
s=re.sub(r'\s*<button class="btn btn-o" type="button" data-czat-otworz[^\n]*</button>','',s,count=1)
must('<section class="s oko" id="oko"','<section class="s oko" id="oko" hidden')
s=re.sub(r'\s*<li><b>Czat widzi tylko liczby</b>.*?</li>','',s,count=1,flags=re.S)
s=re.sub(r'\s*<li><b>Formularz</b>.*?</li>','',s,count=1,flags=re.S)
must('  <Czat konfig={CZAT} />\n','')
must("import Czat from '../components/Czat.astro';\n",'')
must('<a class="logo" href="/"','<a class="logo" href="/dla-firm/narzedzia"')
# bez „wersji pokazowej”: narzędzie działa naprawdę (Kamil 5.11.2026); działa ze starym i nowym Strona.astro
s=re.sub(r'\s*(\{!P\.ogolny && )?<span class="demo(?: demo-hero)?">wersja pokazowa</span>\}?','',s)
s=re.sub(r'\s*<p class="sub demo-info">.*?</p>','',s,count=1,flags=re.S)
s=s.replace('<p class="male">Wersja pokazowa. ','<p class="male">').replace("<p class=\"male\">{!P.ogolny && 'Wersja pokazowa. '}",'<p class="male">')
open(p,'w',encoding='utf-8').write(s)
PY
npm ci --no-audit --no-fund >/dev/null
node scripts/przygotuj.mjs >/dev/null
npx astro build >/dev/null
node "$WZD/scripts/narzedzia/przepisz-sciezki.mjs" dist /narzedzia/jpk
rm -rf "$CEL/jpk"; cp -r dist "$CEL/jpk"

KPIR_REV="$(git -C "$KPIR_SRC" rev-parse --short HEAD 2>/dev/null || echo ?)"; JPK_REV="$(git -C "$JPK_SRC" rev-parse --short HEAD 2>/dev/null || echo ?)"
printf '{"kpir":"%s","jpk":"%s"}\n' "$KPIR_REV" "$JPK_REV" > "$CEL/wersja.json"
echo "zbuduj: public/narzedzia gotowe (kpir $KPIR_REV, jpk $JPK_REV), $(du -sh "$CEL" | cut -f1)"
