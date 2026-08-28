# APES CHRONICLES 🌅

RPG ringan berbasis browser. Kalahkan drama-drama receh sehari-hari lewat battle turn-based, dan buka 50 "kenangan" (foto) sepanjang cerita.

Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa framework, tanpa proses build. Bisa langsung dimainkan di browser mana pun.

## 🎮 Cara main

Buka file `index.html` langsung di browser, atau mainkan versi online-nya (lihat bagian Deploy di bawah).

Progres tersimpan otomatis di browser (localStorage) — kalau kamu tutup tab dan buka lagi, progres tetap ada.

## 📁 Struktur folder

```
rpg-meme-game/
├── index.html              ← halaman utama
├── README.md
├── assets/
│   ├── css/style.css       ← semua styling & tema visual
│   ├── js/game.js          ← logic game (state, battle, save/load)
│   └── photos/             ← taruh foto-foto asli kamu di sini
└── data/
    └── story.js            ← SEMUA teks cerita, dialog, musuh, & daftar foto
```

## ✏️ Cara mengganti foto placeholder dengan foto asli

1. Taruh file foto kamu (jpg/png) ke dalam folder `assets/photos/`.
   Contoh: `assets/photos/01.jpg`, `assets/photos/02.jpg`, dst.

2. Buka file `data/story.js`, cari bagian `PHOTOS`:

   ```js
   const PHOTOS = Array.from({ length: 50 }, (_, i) => {
     const n = i + 1;
     return {
       id: n,
       caption: `Momen Legendaris #${String(n).padStart(2, "0")}`,
       src: "", // isi dengan "assets/photos/namafile.jpg" untuk foto asli
     };
   });
   ```

3. Ganti jadi path foto asli, misalnya untuk foto pertama:

   ```js
   {
     id: 1,
     caption: "Waktu ulang tahun ke-25 gagal total",
     src: "assets/photos/01.jpg",
   }
   ```

   Kamu bisa ganti satu per satu secara manual (ada 50 entri, id 1 sampai 50), atau ganti caption-nya juga sesuai foto masing-masing.

Selama field `src` masih kosong (`""`), game otomatis menampilkan kotak nomor sebagai pengganti — jadi kamu bisa main dulu sebelum semua foto siap.

## ✏️ Cara mengedit / menambah cerita

Semua chapter cerita ada di `data/story.js`, dalam array `STORY`. Setiap chapter formatnya:

```js
{
  id: "ch1",
  title: "Bab 1: Judul Chapter",
  dialog: [
    "Baris dialog pertama.",
    "Baris dialog kedua.",
  ],
  battle: "tagihan",     // opsional — id musuh dari daftar ENEMIES, atau null
  unlock: 1,             // id foto yang terbuka setelah chapter ini selesai
}
```

Kamu juga bisa menambahkan `choices` (pilihan dialog) di akhir chapter — lihat contoh `ch1` di file tersebut.

Daftar musuh ada di objek `ENEMIES`, dan skill yang bisa dipakai hero ada di array `SKILLS` — keduanya juga di file yang sama.

## 🚀 Deploy ke GitHub Pages (supaya orang lain bisa main)

1. **Buat repository baru di GitHub** (misalnya bernama `apes-chronicles`).

2. **Upload semua file** di folder ini ke repo tersebut. Bisa lewat web GitHub (drag & drop) atau lewat git:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Apes Chronicles"
   git branch -M main
   git remote add origin https://github.com/USERNAME/apes-chronicles.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages:**
   - Buka repo di GitHub → tab **Settings**
   - Klik **Pages** di sidebar kiri
   - Di bagian **Source**, pilih branch `main` dan folder `/ (root)`
   - Klik **Save**

4. Tunggu 1-2 menit, lalu buka:
   ```
   https://USERNAME.github.io/apes-chronicles/
   ```

   Ganti `USERNAME` dengan username GitHub kamu.

Selesai — link itu bisa dibagikan ke siapa saja untuk main langsung di browser mereka, tanpa install apa pun.

## 🛠️ Testing lokal sebelum upload

Cukup buka `index.html` langsung dua kali klik di file explorer, atau jalankan server lokal sederhana (opsional, kadang perlu kalau browser membatasi akses file lokal):

```bash
# Python 3
python3 -m http.server 8000
# lalu buka http://localhost:8000 di browser
```

## 🧩 Tips pengembangan lanjutan

- Tambah musuh baru: tambahkan entri baru di objek `ENEMIES` (`data/story.js`).
- Tambah skill baru: tambahkan entri baru di array `SKILLS`.
- Ubah warna tema: semua warna didefinisikan sebagai CSS variable di bagian atas `assets/css/style.css` (`:root { ... }`) — ganti di satu tempat, seluruh tema ikut berubah.
- Ganti musik atau tambah efek suara bisa ditambahkan dengan tag `<audio>` di `index.html` dan dipicu dari `game.js`.
