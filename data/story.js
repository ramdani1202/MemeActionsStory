/* ============================================================
   STORY.JS
   Semua konten cerita, dialog, battle, dan daftar unlock foto
   ada di sini. Untuk menambah/mengedit cerita, cukup ubah file
   ini — tidak perlu menyentuh game.js.
   ============================================================ */

// ------------------------------------------------------------
// KARAKTER UTAMA
// ------------------------------------------------------------
const HERO = {
  name: "Rangga",
  title: "Si Paling Apes",
  maxHp: 100,
  baseAttack: 12,
};

// ------------------------------------------------------------
// DAFTAR 50 FOTO UNLOCK
// Ganti field "src" dengan path foto aslimu, misal:
// "assets/photos/01.jpg"
// Selama "src" masih kosong/placeholder, game akan menampilkan
// kotak nomor otomatis sebagai pengganti.
// ------------------------------------------------------------
const PHOTOS = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    caption: `Momen Legendaris #${String(n).padStart(2, "0")}`,
    src: "", // isi dengan "assets/photos/namafile.jpg" untuk foto asli
  };
});

// ------------------------------------------------------------
// MUSUH-MUSUH
// ------------------------------------------------------------
const ENEMIES = {
  tagihan: {
    name: "Tagihan Akhir Bulan",
    maxHp: 40,
    attack: 8,
    sprite: "🧾",
  },
  mantan: {
    name: "Chat Mantan Jam 2 Pagi",
    maxHp: 55,
    attack: 10,
    sprite: "📱",
  },
  bos: {
    name: "Bos yang WA Hari Minggu",
    maxHp: 70,
    attack: 12,
    sprite: "💼",
  },
  deadline: {
    name: "Deadline Mepet",
    maxHp: 90,
    attack: 15,
    sprite: "⏰",
  },
  wifi: {
    name: "Wifi Lelet Pas Meeting",
    maxHp: 65,
    attack: 11,
    sprite: "📶",
  },
  finalboss: {
    name: "Rasa Malas Tingkat Dewa",
    maxHp: 150,
    attack: 18,
    sprite: "😴",
  },
};

// ------------------------------------------------------------
// SKILL YANG BISA DIPAKAI HERO SAAT BATTLE
// ------------------------------------------------------------
const SKILLS = [
  {
    id: "pukul",
    name: "Pukul Kasar",
    desc: "Serangan dasar, damage kecil.",
    damageMult: 1,
    cooldown: 0,
  },
  {
    id: "skip",
    name: "Skip Masalah",
    desc: "Damage sedang, kadang meleset.",
    damageMult: 1.6,
    cooldown: 1,
    missChance: 0.25,
  },
  {
    id: "healing",
    name: "Healing Micin",
    desc: "Pulihkan sedikit HP, bukan menyerang.",
    heal: 18,
    cooldown: 2,
  },
  {
    id: "ultimate",
    name: "Julid Ultimate",
    desc: "Damage besar, cooldown lama.",
    damageMult: 2.4,
    cooldown: 3,
  },
];

// ------------------------------------------------------------
// CHAPTER / ALUR CERITA
// Setiap chapter punya:
//  - dialog: array baris dialog (ditampilkan satu per satu)
//  - choices: opsional, pilihan yang bikin cerita bercabang
//  - battle: opsional, id musuh dari ENEMIES yang harus dilawan
//  - unlock: id foto (dari PHOTOS) yang terbuka setelah chapter selesai
// ------------------------------------------------------------
const STORY = [
  {
    id: "ch1",
    title: "Bab 1: Senin Pagi yang Menipu",
    dialog: [
      "Alarm bunyi jam 6 pagi. Rangga bangun dengan pede tinggi: 'Hari ini gue produktif!'",
      "Buka HP... 47 notifikasi grup kerja. Semua isinya 'urgent'.",
      "Rangga menghela napas panjang sambil menyeduh kopi sachetan ketiga minggu ini yang dicampur air keran.",
    ],
    choices: [
      { text: "Hadapi grup WA dengan gagah berani", next: "battle" },
      { text: "Pura-pura HP mati", next: "battle" },
    ],
    battle: "tagihan",
    unlock: 1,
  },
  {
    id: "ch2",
    title: "Bab 2: Notifikasi dari Masa Lalu",
    dialog: [
      "Baru menang lawan tagihan, tiba-tiba HP bergetar. 'Xxx mengirim pesan.'",
      "Rangga tahu persis siapa itu. Jantungnya berdegup lebih kencang daripada saat diomelin atasan.",
      "'Halo, kamu apa kabar?' — jam 2 siang, bukan jam 2 pagi. Tapi tetap saja bikin senewen.",
    ],
    battle: "mantan",
    unlock: 2,
  },
  {
    id: "ch3",
    title: "Bab 3: Minggu Bukan Berarti Libur",
    dialog: [
      "Rangga baru mau rebahan menikmati me-time, layar HP menyala: 'Pak Bos mengetik...'",
      "'Halo maaf ganggu weekend, ada yang urgent dikit'",
      "Kata 'dikit' itu yang paling menakutkan sedunia.",
    ],
    battle: "bos",
    unlock: 3,
  },
  {
    id: "ch4",
    title: "Bab 4: H-1 Sebelum Kiamat",
    dialog: [
      "Kalender merah menyala terang: DEADLINE BESOK.",
      "Progress kerjaan Rangga baru 12%. Sisanya masih di alam mimpi.",
      "Waktunya panik terkendali sambil tetap scroll medsos 5 menit sekali.",
    ],
    battle: "deadline",
    unlock: 4,
  },
  {
    id: "ch5",
    title: "Bab 5: Meeting Online Penuh Drama",
    dialog: [
      "Tepat saat presentasi dimulai, wifi rumah memutuskan untuk healing sendiri.",
      "'Halo... kedengeran gak... halo?' — kalimat sejuta umat pekerja WFH.",
      "Rangga menyalakan hotspot HP sambil berdoa kuota masih ada.",
    ],
    battle: "wifi",
    unlock: 5,
  },
  {
    id: "ch6",
    title: "Bab Akhir: Musuh Sejati",
    dialog: [
      "Setelah semua drama itu, Rangga sadar musuh terbesarnya bukan bos, bukan mantan, bukan wifi.",
      "Musuh sejatinya duduk manis di kasur, berbisik: 'Rebahan 5 menit lagi aja...'",
      "Ini dia. Final boss yang sesungguhnya.",
    ],
    battle: "finalboss",
    unlock: 6,
  },
];

/* ------------------------------------------------------------
   Chapter tambahan otomatis (untuk mengisi sisa unlock foto
   7–50) menggunakan potongan cerita ringan bergaya "epilog"
   yang berulang tapi tetap kontekstual. Kamu bisa menimpa isi
   ini kapan saja dengan menuliskan chapter manual di atas.
------------------------------------------------------------ */
const EPILOG_TEMPLATES = [
  "Rangga menemukan struk belanja lama di saku jaket. Isinya cuma indomie dan skincare.",
  "Grup keluarga rame lagi. Bukan soal penting, cuma broadcast hoax yang sama untuk ke-100 kalinya.",
  "Rangga cek saldo rekening. Emosinya lebih naik turun daripada saham gorengan.",
  "Tetangga nyalain lagu dangdut jam 11 malam. Rangga cuma bisa pasrah sambil headset-an.",
  "Paket online shop akhirnya sampai — setelah dua minggu perjalanan yang lebih dramatis dari sinetron.",
  "Rangga niat diet, tapi promo ayam geprek muncul di linimasa tepat jam makan siang.",
  "Baterai HP 1% pas lagi nunggu OTP penting. Rangga lari nyari colokan kayak final race.",
  "Ada yang salah ketik nama Rangga di undangan. Tetap datang demi kondangan gratis.",
  "Rangga niat nabung, eh flash sale lewat begitu saja di depan mata.",
  "Kucing tetangga masuk rumah dan tidur di laptop kerjaan Rangga yang belum ke-save.",
];

// Generate chapter epilog untuk unlock ke-7 sampai ke-50
for (let i = 7; i <= 50; i++) {
  const idx = (i - 7) % EPILOG_TEMPLATES.length;
  STORY.push({
    id: `ch${i}`,
    title: `Cerita Receh #${i - 6}`,
    dialog: [
      EPILOG_TEMPLATES[idx],
      "Hidup emang penuh kejutan kecil kayak gini.",
    ],
    battle: null,
    unlock: i,
  });
}

// Ekspor ke window supaya bisa diakses game.js (tanpa module bundler)
window.GAME_DATA = { HERO, PHOTOS, ENEMIES, SKILLS, STORY };
