# Vantrex Classroom

**Platform Kelas Online (LMS) sederhana mirip Google Classroom** — dibuat dengan Next.js, login pakai Google, data tersimpan di Upstash Redis, dan file lampiran (foto/video/dokumen) disimpan di Vercel Blob. Berjalan penuh di HP Android: tidak perlu laptop, tidak perlu VPS, semua layar mobile-first dan ramah sentuhan.

Bahasa antarmuka: **Bahasa Indonesia**.

---

## ✨ Fitur per Role

### 👑 Owner (Admin / Pengelola)
- Statistik ringkas: jumlah user per role, jumlah kelas, tugas, dan kuis.
- Melihat seluruh daftar user (foto, nama, email, role, tanggal daftar).
- Mengubah role user: **murid ↔ guru** (email yang diatur di `OWNER_EMAIL` otomatis menjadi owner).
- Melihat log aktivitas seluruh platform dan daftar ringkas semua kelas.
- Bergabung ke **Lobby Guru** (khusus guru + owner) maupun **Chat Publik** (semua role).
- Mengatur profil sendiri: **Display Name** (nama tampilan) dan bio.

### 👨‍🏫 Guru
- Membuat, mengedit, dan menghapus kelas; melihat **kode invite 6 karakter** untuk dibagikan ke siswa.
- Membuat **materi**, **tugas** (dengan tenggat waktu & bobot nilai), dan **kuis pilihan ganda** (dengan batas waktu).
- Melihat daftar pengumpulan tugas tiap siswa, memberi nilai + komentar.
- Melihat hasil skor kuis tiap siswa secara otomatis.
- Melihat daftar siswa di kelas yang diampu.
- **Lobby Guru**: chat khusus guru + owner (murid tidak bisa masuk); serta **Chat Publik** yang bisa diisi semua role.
- Mengatur profil sendiri: **Display Name** (nama tampilan) dan bio.

### 🎒 Murid (Siswa)
- Melihat semua kelas yang diikuti dan daftar kelas yang tersedia.
- **Gabung kelas** cukup dengan memasukkan kode invite 6 karakter.
- Melihat feed kelas: materi, tugas, dan kuis.
- Mengumpulkan tugas: teks + lampiran **foto / video / dokumen**; status otomatis **Terkumpul / Terlambat / Belum**.
- Mengerjakan kuis pilihan ganda; skor langsung muncul setelah selesai, beserta kunci jawaban.
- **Gradebook**: melihat nilai tugas dan kuis per kelas.
- **Chat Publik**: ruang diskusi terbuka untuk murid, guru, dan owner (Lobby Guru khusus guru + owner tidak dapat diakses murid).
- Melihat daftar guru dan siswa seluruh platform (tampil dengan nama tampilan + label role); mengatur profil sendiri: **Display Name** dan bio.

---

## 🏷️ Nama Tampilan, Label Role, dan Tampilan Pesan Chat

- **Display Name**: setiap user bisa mengatur nama tampilan sendiri di halaman profil (disimpan di field `displayName` pada `users:{uid}`). Jika Display Name kosong, aplikasi otomatis memakai nama akun Google OAuth (`name`). Nama Google asli tidak pernah ditimpa.
- **Bio**: catatan singkat diri di field `bio` pada `users:{uid}`, bisa diisi/kosongkan lewat halaman profil.
- **Label role Bahasa Indonesia** (helper `roleLabel`): `owner` → **Owner**, `teacher` → **Guru**, `student` → **Murid**. Label ini tampil konsisten di daftar user, daftar guru, daftar siswa, panel owner, dan pesan chat.
- **Dua ruang chat**:
  - **Lobby Guru** (`/guru/lobby`) — hanya guru + owner; murid ditolak di halaman maupun saat mengirim pesan.
  - **Chat Publik** (`/chat`) — bisa diakses semua role (murid, guru, owner), tanpa gating role.
- **Isi pesan chat**: setiap pesan menampilkan baris identitas di atas isi pesan: **nama pengirim — label role** (mis. `Budi — Murid`), lalu isi pesan, lalu waktu kirim; avatar Google ditampilkan bila tersedia. Saat pesan dikirim, snapshot nama, role, dan foto pengirim disimpan bersama pesan.

## 🧰 Tech Stack Singkat

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19, TypeScript |
| Styling | Tailwind CSS v3 (mobile-first, palet hijau/teal + slate) |
| Autentikasi | Auth.js (next-auth v5 beta) — Google OAuth |
| Database | Upstash Redis (REST API, `@upstash/redis`) |
| Penyimpanan file | Vercel Blob (`@vercel/blob`) |
| Ikon | lucide-react |
| Hosting | Vercel (serverless) |

> Redis hanya menyimpan **data JSON/metadata** (profil, kelas, tugas, nilai, pesan). File lampiran **tidak** disimpan di Redis — file disimpan di Vercel Blob, Redis hanya menyimpan URL-nya.

---

## 📋 Prasyarat: Akun Gratis yang Perlu Disiapkan

Semua bisa didaftarkan lewat browser HP (Chrome/Firefox Android):

1. **Akun GitHub** — untuk menyimpan kode proyek (gratis di github.com).
2. **Akun Vercel** — untuk hosting & deploy (gratis, login bisa pakai akun GitHub) di vercel.com.
3. **Akun Upstash** — untuk database Redis gratis di upstash.com (bisa daftar pakai GitHub).
4. **Akun Google** + akses **Google Cloud Console** (console.cloud.google.com) — untuk membuat login Google (OAuth Client ID). Akun Google ini sekaligus akan menjadi email owner.

Tidak perlu kartu kredit untuk paket gratis dasar.

---

## 🚀 Panduan Setup Langkah demi Langkah (Bisa dari HP)

### Langkah 1 — Buat Database Upstash Redis

1. Buka **upstash.com** → **Sign Up** (pilih daftar dengan GitHub) → verifikasi email bila diminta.
2. Klik **Create Database** → pilih plan **Free**.
3. Pilih region terdekat (misalnya Singapore), beri nama bebas (mis. `vantrex`), lalu buat.
4. Buka database tersebut → bagian **REST API** → salin dua nilai berikut:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

Simpan dua nilai ini, nanti ditempel ke Vercel.

### Langkah 2 — Konfigurasi Login Google (Google Cloud Console)

1. Buka **console.cloud.google.com** → login dengan akun Google yang akan menjadi **owner**.
2. Buat project baru: **Select a project** (pojok kiri atas) → **New Project** → beri nama mis. `vantrex-classroom` → **Create**.
3. Buat **OAuth consent screen**:
   - Menu **APIs & Services** → **OAuth consent screen**.
   - Pilih user type **External** → **Create**.
   - Isi: App name (mis. `Vantrex Classroom`), User support email (email owner), Developer contact email (email owner) → simpan sampai selesai.
   - Di bagian **Test users**, tambahkan email owner (dan email guru/murid yang akan menguji) → **Save**.
   - > Selama aplikasi berstatus "Testing", hanya email yang terdaftar di Test users yang boleh login.
4. Buat **OAuth Client ID**:
   - Menu **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Tambahkan **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (untuk uji di komputer lokal)
     - `https://<domain-vercel-anda>/api/auth/callback/google` (untuk produksi; domain ini baru diketahui setelah deploy di Langkah 5 — boleh ditambah/diubah belakangan)
   - Klik **Create**.
5. Salin:
   - **Client ID** → nanti menjadi `AUTH_GOOGLE_ID`
   - **Client Secret** → nanti menjadi `AUTH_GOOGLE_SECRET`
6. Buat **`AUTH_SECRET`** (kunci acak penanda sesi login):
   - Kalau ada komputer: jalankan `npx auth secret` di folder proyek, lalu salin nilainya.
   - Kalau hanya dari HP: buka situs pembuat password/string acak (mis. random password generator), buat string acak panjang (minimal 32 karakter, campuran huruf & angka), lalu salin sebagai nilai `AUTH_SECRET`.

### Langkah 3 — Buat Vercel Blob Store (Penyimpanan File)

1. Buka **vercel.com** → login dengan akun GitHub.
2. Masuk ke project (atau buat project kosong dulu sesuai Langkah 5) → tab **Storage** → **Create Database** → pilih **Blob** → plan **Free**.
3. Setelah store dibuat, buka detailnya → salin token **`BLOB_READ_WRITE_TOKEN`** (diawali `vercel_blob_rw_...`).

> Token ini rahasia — jangan pernah dibagikan atau ditulis ke file yang di-publish ke internet.

### Langkah 4 — Nama Aplikasi & Email Owner

- **`APP_NAME`**: boleh dikosongkan; default-nya `Vantrex Classroom`. Diisi bila ingin nama aplikasi lain (mis. nama sekolah).
- **`OWNER_EMAIL`**: isi dengan **email Google owner, huruf kecil, persis** seperti saat login pertama. Siapa pun yang login dengan email ini otomatis mendapat role **owner**. User pertama lain yang login akan menjadi **murid** dan bisa dipromosikan menjadi guru oleh owner.

### Langkah 5 — Deploy ke Vercel

1. **Unggah kode ke GitHub**:
   - Buka github.com di browser HP → buat repository baru (nama bebas, mis. `vantrex-classroom`; Private/Public bebas).
   - Gunakan **Add file → Upload files** untuk mengunggah seluruh file proyek (atau pakai GitHub mobile app). Pastikan semua folder `app/`, `components/`, `lib/`, dan file konfigurasi ikut terunggah.
2. **Import ke Vercel**:
   - Buka vercel.com → **Add New…** → **Project** → **Import Git Repository** → pilih repo GitHub tanda (izinkan akses Vercel ke GitHub bila diminta).
3. **Isi Environment Variables**:
   - Di halaman konfigurasi import, buka bagian **Environment Variables**.
   - Isi semua variabel wajib sesuai tabel di bawah (pola sama dengan file `.env.example` di proyek).
4. Klik **Deploy** → tunggu proses build selesai (beberapa menit).
5. Buka domain yang diberikan, mis. `https://vantrex-classroom.vercel.app`.
6. **Kembali ke Google Cloud Console (Langkah 2.4)**, pastikan redirect URI produksi `https://<domain-vercel-anda>/api/auth/callback/google` sudah terdaftar.
7. Buka aplikasi → klik **Masuk dengan Google** → login memakai email `OWNER_EMAIL`. Akun ini otomatis menjadi owner.

> Setiap kali ada perubahan kode yang di-push ke GitHub, Vercel akan otomatis build & deploy ulang.

---

## 🔑 Tabel Environment Variables

Nilai ditempel di **Vercel → Project → Settings → Environment Variables** (dan untuk pengembangan lokal di file `.env.local`, meniru `.env.example`).

| Nama Variabel | Wajib / Opsional | Fungsi |
| --- | --- | --- |
| `APP_NAME` | Opsional | Nama aplikasi yang tampil di halaman login & navbar. Kosongkan untuk memakai default `Vantrex Classroom`. |
| `OWNER_EMAIL` | **Wajib** | Email Google (huruf kecil) yang otomatis dipaksa menjadi role `owner` saat login. |
| `AUTH_SECRET` | **Wajib** | Kunci acak untuk menandatangani token sesi Auth.js. Buat via `npx auth secret` atau string acak panjang. |
| `AUTH_GOOGLE_ID` | **Wajib** | OAuth Client ID dari Google Cloud Console. |
| `AUTH_GOOGLE_SECRET` | **Wajib** | OAuth Client Secret dari Google Cloud Console. |
| `AUTH_URL` (fallback `NEXTAUTH_URL`) | Opsional | URL dasar aplikasi. Di Vercel terisi otomatis; untuk lokal isi `http://localhost:3000`. |
| `UPSTASH_REDIS_REST_URL` | **Wajib** | URL REST database Upstash Redis. |
| `UPSTASH_REDIS_REST_TOKEN` | **Wajib** | Token REST database Upstash Redis. |
| `BLOB_READ_WRITE_TOKEN` | **Wajib** | Token read/write Vercel Blob untuk menyimpan file lampiran. |

---

## 🗂️ Skema Key Redis

Semua akses Redis hanya dilakukan dari sisi server (Server Component / Server Action / Route Handler).

| Key | Tipe | Isi & Fungsi |
| --- | --- | --- |
| `users:{uid}` | JSON | Profil user: `name` (nama Google OAuth), `displayName` (nama tampilan pilihan; bila kosong dipakai `name`), `bio` (catatan singkat), email, foto, role (`owner`/`teacher`/`student`), tanggal daftar, status nonaktif. |
| `users:by-email` | HASH | Pemetaan email (huruf kecil) → `uid`, untuk mencari user berdasarkan email saat login. |
| `users:index` | SET | Daftar semua `uid` user (untuk daftar user & statistik owner). |
| `classes:{id}` | JSON | Data kelas: nama, mapel/subjek, deskripsi, `ownerId`, kode invite, tanggal dibuat. |
| `classes:index` | SET | Daftar semua `id` kelas. |
| `class:members:{classId}` | SET | Daftar `uid` anggota (siswa) yang sudah gabung ke kelas. |
| `class:feed:{classId}` | LIST | Urutan `feedItemId` di kelas (dari lama ke baru; antarmuka menampilkan terbaru lebih dulu). |
| `feed:{itemId}` | JSON | Isi feed kelas: materi (prefix `mat_`), tugas (`asg_`), atau kuis (`quiz_`), lengkap dengan lampiran. |
| `submissions:{assignmentId}:{uid}` | JSON | Pengumpulan tugas: teks, lampiran, waktu submit, status terlambat (`late`), nilai, feedback, pemberi nilai. |
| `quiz:results:{quizId}:{uid}` | JSON | Hasil kuis: jawaban per soal, skor, total soal benar, waktu submit. |
| `chat:lobby` | LIST | Pesan **Lobby Guru** khusus guru + owner (maksimal 200 pesan terbaru, dipangkas otomatis). Tiap pesan menyimpan snapshot nama tampilan, label role, dan foto pengirim. |
| `chat:public:messages` | LIST | Pesan **Chat Publik** untuk semua role (murid/guru/owner; maksimal 200 pesan terbaru, dipangkas otomatis). Tiap pesan menyimpan snapshot nama tampilan, label role, dan foto pengirim. |
| `activity:log` | LIST | Catatan aktivitas platform (maksimal 500 entri, dipangkas otomatis): login, kelas dibuat, tugas dikumpulkan, nilai diberikan, role diubah, dll. |

---

## 📖 Cara Pakai Sehari-hari (Ringkas)

1. **Login**: buka aplikasi → **Masuk dengan Google**. Login pertama memakai email `OWNER_EMAIL` otomatis menjadi **owner**.
2. **Owner mengatur role**: di halaman owner, temukan user yang login (murid) → ubah role menjadi **guru**. Guru bisa diubah kembali menjadi murid kapan saja.
3. **Guru membuat kelas**: menu Kelas → **Buat Kelas** (isi nama, mapel, deskripsi) → buka detail kelas → salin **kode invite 6 karakter** dan bagikan ke siswa.
4. **Murid gabung kelas**: menu Kelas → tempel kode invite → **Gabung**.
5. **Guru membuat konten**: di dalam kelas, buat **Materi**, **Tugas** (tenggat waktu + bobot), atau **Kuis** (pilihan ganda + batas waktu), boleh dilampiri file.
6. **Murid mengumpulkan tugas**: buka tugas → tulis jawaban + unggah foto/video/dokumen → kirim. Status berubah menjadi Terkumpul/Terlambat.
7. **Murid mengerjakan kuis**: buka kuis → jawab pilihan ganda → skor langsung tampil beserta kunci.
8. **Guru menilai**: di halaman tugas, lihat daftar submission → beri nilai & komentar; hasil kuis tampil otomatis per siswa.
9. **Dua ruang chat**: **Lobby Guru** hanya untuk guru + owner (murid tidak punya akses ke halaman maupun kirim pesan); **Chat Publik** terbuka untuk murid, guru, dan owner. Setiap pesan menampilkan **nama pengirim — label role** (Owner / Guru / Murid) di atas isi pesan, lalu waktu kirim.
10. **Profil & nama tampilan**: di halaman **Profil**, user bisa mengisi **Display Name** dan bio. Bila Display Name kosong, aplikasi otomatis memakai nama akun Google; nama Google asli tidak ditimpa.
11. **Nilai murid**: halaman **Nilai** menampilkan gradebook per kelas (nilai tugas berbobot + nilai kuis).

---

## ⚠️ Batasan Free Tier (Penting Dibaca Jujur)

### Upstash Redis (Free)
- Kuota data sekitar **256 MB**.
- Sekitar **500.000 command/bulan** (setiap baca/tulis data dihitung sebagai command).
- Bandwidth sekitar **10 GB/bulan**.
- Cocok untuk kelas kecil/menengah dan uji coba. Untuk ratusan siswa aktif, pantau usage di dashboard Upstash dan pertimbangkan paket berbayar.

### Vercel (Hobby)
- Paket **Hobby ditujukan untuk penggunaan non-komersial/personal**; jangan dipakai untuk layanan komersial.
- Fungsi serverless mengalami **cold start**: permintaan pertama setelah aplikasi menganggur beberapa menit bisa lambat beberapa detik (terutama saat upload), lalu cepat kembali.
- Build & bandwidth gratis terbatas; pantau usage di dashboard Vercel.

### Vercel Blob (Free)
- Kuota penyimpanan & bandwidth gratis **terbatas** (angka terbaru cek di dashboard Vercel). File video dan foto beresolusi tinggi cepat memakan kuota.

### Batas Ukuran Upload
| Jenis File | Batas di Aplikasi | Catatan Penting |
| --- | --- | --- |
| Gambar (foto) | ± 8 MB | Sejauh ini aman di kuota gratis. |
| Video | ± 25 MB (validasi aplikasi) | **Fungsi serverless Vercel Hobby punya batas body request sekitar 4.5 MB**, jadi video panjang/HD kemungkinan besar ditolak platform. Kompres/perkecil video dulu (mis. resolusi kecil, durasi pendek) lewat aplikasi edit video HP sebelum dikumpulkan. |
| Dokumen (PDF, doc, zip, dll.) | ± 10 MB | Tetap perhatikan kuota Blob. |

- File lampiran disimpan di **Vercel Blob**, bukan di Redis; Redis hanya menyimpan metadata & URL file.
- Tipe file yang diterima mengikuti daftar MIME yang divalidasi di sisi server; file berbahaya (executable/script) ditolak.

---

## 📁 Struktur Folder Proyek

```
vantrex-classroom/
├── app/
│   ├── layout.tsx                 # Layout global + palet warna
│   ├── globals.css                # Gaya dasar Tailwind
│   ├── page.tsx                   # Redirect / → /dashboard
│   ├── login/page.tsx             # Halaman "Masuk dengan Google"
│   ├── dashboard/page.tsx         # Redirect otomatis sesuai role
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Handler Auth.js
│   │   └── upload/route.ts        # Endpoint upload file ke Blob
│   ├── owner/                     # Halaman owner/admin
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Statistik + daftar user + log aktivitas
│   │   ├── profil/page.tsx        # Edit Display Name + Bio owner
│   │   └── actions.ts             # Server action ubah role & update profil
│   ├── guru/                      # Halaman guru
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Ringkasan mengajar
│   │   ├── actions.ts
│   │   ├── kelas/
│   │   │   ├── page.tsx           # Daftar kelas + buat kelas
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Detail kelas + kode invite + feed
│   │   │       ├── materi-baru/page.tsx
│   │   │       ├── tugas-baru/page.tsx
│   │   │       └── kuis-baru/page.tsx
│   │   ├── tugas/[id]/page.tsx    # Daftar submission + beri nilai
│   │   ├── kuis/[id]/page.tsx     # Hasil kuis per siswa
│   │   ├── siswa/page.tsx         # Siswa di kelas yang diampu
│   │   ├── lobby/page.tsx         # Lobby Guru (khusus guru + owner)
│   │   └── profil/page.tsx        # Edit Display Name + Bio guru
│   ├── chat/                      # Chat Publik (semua role)
│   │   ├── layout.tsx             # requireUser saja, tanpa gating role
│   │   └── page.tsx               # Ruang chat publik pakai ChatRoom
│   └── murid/                     # Halaman siswa
│       ├── layout.tsx
│       ├── page.tsx               # Beranda siswa
│       ├── actions.ts
│       ├── kelas/
│       │   ├── page.tsx           # Kelas diikuti + gabung via kode
│       │   └── [id]/page.tsx      # Feed kelas
│       ├── tugas/[id]/page.tsx    # Detail + kumpul tugas
│       ├── kuis/[id]/page.tsx     # Kerjakan kuis + skor
│       ├── nilai/page.tsx        # Gradebook per kelas
│       ├── guru/page.tsx           # Daftar global guru (nama tampilan + label role)
│       ├── siswa/page.tsx          # Daftar global siswa (nama tampilan + label role)
│       └── profil/page.tsx         # Edit Display Name + Bio murid
├── components/
│   ├── ui/                        # Button, Card, Input, Textarea, Label,
│   │                             # Badge, Avatar, EmptyState, StatCard, Field
│   ├── AppShell.tsx               # Navbar atas + kerangka halaman
│   ├── LogoutButton.tsx
│   ├── AttachmentList.tsx         # Daftar lampiran (nama + link unduh)
│   ├── DateTime.tsx               # Format tanggal Bahasa Indonesia
│   ├── ChatRoom.tsx               # Komponen chat reusable: daftar pesan + form kirim
│   │                             # tiap pesan: nama — label role, isi, waktu
│   ├── teacher/                   # Komponen khusus guru
│   └── student/                    # Komponen khusus siswa
├── lib/
│   ├── types.ts                   # Tipe TypeScript bersama
│   ├── redis.ts                   # Koneksi Upstash Redis
│   ├── users.ts                   # Profil, role, login Google; getDisplayName() & roleLabel()
│   ├── rbac.ts                    # Proteksi route berdasarkan role
│   ├── activity.ts                # Log aktivitas
│   ├── app-name.ts                # Ambil APP_NAME dengan fallback
│   ├── blob.ts                    # Validasi & upload file ke Blob
│   ├── classes.ts                 # Logika kelas & kode invite
│   ├── feed.ts                    # Urutan feed kelas
│   ├── materials.ts               # Materi
│   ├── assignments.ts             # Tugas + submission + penilaian
│   ├── quizzes.ts                 # Kuis + hasil + koreksi otomatis
│   └── chat.ts                    # Dua ruang chat: Lobby Guru (guru+owner) & Chat Publik (semua role)
├── auth.ts                        # Konfigurasi Auth.js (Google provider)
├── middleware.ts                  # Proteksi route login-only
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── .env.example                   # Contoh daftar environment variable
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap Fitur Lanjutan (BELUM ADA di versi ini)

Fitur-fitur berikut **belum tersedia** pada rilis ini dan direncanakan untuk pengembangan lanjutan:

| Fitur | Status | Keterangan |
| --- | --- | --- |
| Komentar per materi | ❌ Belum ada | Diskusi di bawah tiap materi/tugas. |
| Email undangan otomatis | ❌ Belum ada | Undangan kelas dikirim otomatis ke email siswa. |
| Notifikasi push / email | ❌ Belum ada | Pengingat tugas & kuis lewat push notifikasi/email. |
| Nilai rata-rata otomatis di gradebook | ❌ Belum ada | Agregat nilai akhir per siswa (bobot tugas + kuis). |
| Rekam video langsung | ❌ Belum ada | Rekam video dari kamera HP langsung di aplikasi. |
| Moderasi chat (Lobby Guru & Chat Publik) | ❌ Belum ada | Hapus pesan, filter kata, laporan pesan tidak pantas di kedua ruang chat. |
| Dark mode | ❌ Belum ada | Tema gelap sebagai pilihan tampilan. |
| Koin / poin | ❌ Belum ada | Gamifikasi: poin dari pengumpulan tugas & kuis. |
| Kalender akademik | ❌ Belum ada | Kalender tenggat tugas/kuis dalam tampilan kalender. |

---

## 🩹 Troubleshooting Singkat

| Gejala | Kemungkinan Penyebab | Solusi |
| --- | --- | --- |
| Login Google gagal / error `redirect_uri_mismatch` atau akun ditolak | Redirect URI tidak terdaftar di Google Cloud Console, atau email tidak ada di Test users | Pastikan URI `https://<domain>/api/auth/callback/google` (dan `http://localhost:3000/...` untuk lokal) persis terdaftar; tambahkan email akun ke **Test users** di OAuth consent screen; cek `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` tidak salah tempel. |
| Halaman kosong / data tidak muncul setelah login | Env Upstash salah atau database kosong | Cek `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` di Vercel benar (satu database, tanpa spasi); coba login ulang. |
| Upload file gagal | Token Blob salah/kurang, file melebihi batas, atau video terlalu besar untuk body request serverless | Cek `BLOB_READ_WRITE_TOKEN`; pastikan ukuran sesuai tabel batas; kompres video (di bawah ±4.5 MB) sebelum dikumpulkan; cek kuota Blob di dashboard. |
| Build error di Vercel (deploy merah/gagal) | Ada environment variable wajib yang kosong atau salah nama | Buka **Settings → Environment Variables**, pastikan semua variabel wajib terisi persis nama-nya (lihat tabel & `.env.example`), lalu **Redeploy**. |
| Akun pertama tidak menjadi owner | `OWNER_EMAIL` tidak sama persis dengan email Google yang dipakai login | Samakan huruf besar/kecil dan karakter; jangan pakai alias titik/plus; simpan ulang env lalu redeploy. |
| Halaman lama terbuka / perubahan tidak muncul | Cache browser HP | Tutup tab, buka ulang, atau bersihkan cache browser. |

---

## 💻 (Opsional) Menjalankan di Komputer Lokal

Bila suatu saat memakai laptop:

```bash
# 1. Install dependency
npm install

# 2. Salin contoh env dan isi nilainya
cp .env.example .env.local
# untuk lokal, set AUTH_URL=http://localhost:3000
# dan daftarkan redirect URI http://localhost:3000/api/auth/callback/google

# 3. Jalankan mode pengembangan
npm run dev
# buka http://localhost:3000
```

Build produksi: `npm run build` lalu `npm start`.

---

Dibangun untuk belajar mengajar dari HP — semoga bermanfaat. 🎓
