#!/usr/bin/env node
/* Merakit tampilan statis (Vercel) dari berkas di ../src.
 * - JS dan CSS diperkecil (esbuild), nama berkasnya memuat sidik isi, lalu disimpan browser selamanya (lihat vercel.json).
 *   Saat rilis baru, sidik berganti sehingga browser mengambil berkas baru; index.html selalu diperiksa ulang.
 * Pemakaian:  node web/build.js          -> web/dist
 * Opsional :  API_URL=https://script.google.com/macros/s/XXXX/exec node web/build.js */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SRC = path.join(__dirname, '..', 'src'), OUT = path.join(__dirname, 'dist');
const rd = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const unwrap = (s, tag) => s.replace(new RegExp('^\\s*<' + tag + '[^>]*>'), '').replace(new RegExp('</' + tag + '>\\s*$'), '').trim() + '\n';
let esbuild = null;
try { esbuild = require('esbuild'); } catch (e) { console.log('esbuild tidak ada: berkas tidak diperkecil'); }
const kecil = (kode, loader) => esbuild ? esbuild.transformSync(kode, { loader, minify: true, charset: 'utf8', target: loader === 'css' ? 'chrome88' : 'es2017', legalComments: 'none' }).code : kode;
const sidik = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

const js = kecil(unwrap(rd('JavaScript.html'), 'script'), 'js'), css = kecil(unwrap(rd('Stylesheet.html'), 'style'), 'css');
const namaJs = 'assets/app.' + sidik(js) + '.js', namaCss = 'assets/style.' + sidik(css) + '.css', versi = sidik(js + css);
let cfg = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
if (process.env.API_URL) {
  if (!/^https:\/\/script\.google\.com\/[^\s"'<>]+$/.test(process.env.API_URL)) throw new Error('API_URL tidak valid');
  cfg = 'window.DKPPKB_API = ' + JSON.stringify(process.env.API_URL) + ';\n';
}
const cfgRingkas = cfg.replace(/\/\*[\s\S]*?\*\//g, '').trim();

let html = rd('Index.html')
  .replace(/\s*<base target="_top">/, '')
  .replace(/data-logo="<\?= logoUrl \?>"/, 'data-logo=""')
  .replace(/data-nama="<\?= namaApp \?>"/, 'data-nama="DKPPKB Sulbar"')
  .replace(/data-sub="<\?= subApp \?>"/, 'data-sub="Intelligence"')
  .replace(/<\?!= include\('Stylesheet'\) \?>/, () => '<link rel="stylesheet" href="' + namaCss + '">')
  .replace(/<\?!= include\('JavaScript'\) \?>/, () => '<script>' + cfgRingkas + 'window.DKPPKB_VER=' + JSON.stringify(versi) + ';</script>\n  <script src="' + namaJs + '"></script>');
if (/<\?/.test(html)) throw new Error('Masih ada tag template di Index.html');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, namaCss), css);
fs.writeFileSync(path.join(OUT, namaJs), js);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('Selesai: ' + OUT + ' · ' + namaJs + ' ' + Math.round(js.length / 1024) + ' KB · ' + namaCss + ' ' + Math.round(css.length / 1024) + ' KB · index.html ' + Math.round(html.length / 1024) + ' KB');
