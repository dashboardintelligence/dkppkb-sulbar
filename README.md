# DKPPKB Sulbar Intelligence — Tampilan Web

Repo **publik** berisi tampilan statis (HTML/CSS/JS) untuk GitHub Pages. Tidak ada data, sandi, atau kode server di sini.
Data dan logika tetap di Google Apps Script (repo private `akun-dkppkb-intelligence`); tampilan ini memanggilnya lewat API JSON.

## Memasang
1. Settings > Pages > Build and deployment > Source = **GitHub Actions**.
2. Settings > Secrets and variables > Actions > tab **Variables** > New repository variable:
   `API_URL` = URL web app Apps Script (berakhiran `/exec`, deployment berakses "Siapa saja").
3. Tab Actions > "Terbitkan ke GitHub Pages" > Run workflow. Alamat situs muncul di ringkasan job
   (biasanya `https://<akun>.github.io/<nama-repo>/`).

## Memperbarui tampilan
Berkas di `src/` (`Index.html`, `Stylesheet.html`, `Latar.html`, `JavaScript.html`) adalah salinan dari repo private.
Setelah tampilan diubah di repo private, salin keempat berkas itu ke sini lalu push.

## Uji lokal
`API_URL=https://script.google.com/macros/s/XXXX/exec node web/build.js && npx serve web/dist`
