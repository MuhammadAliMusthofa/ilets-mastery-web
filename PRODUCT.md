# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — pelajar mandiri berbahasa Indonesia** yang belajar sendiri tanpa kelas atau tutor. Platform ini adalah satu-satunya pembimbing mereka, jadi setiap langkah harus menjelaskan dirinya sendiri: apa yang harus dikerjakan, kenapa, dan seberapa jauh lagi.
  - Mereka yang menyiapkan **IELTS General Training** — umumnya untuk migrasi, kerja, atau pelatihan di luar negeri — dengan tanggal tes dan target band yang nyata.
  - Mereka yang fondasi bahasa Inggrisnya belum kuat dan butuh jalur **Beginner → Advanced** sebelum menyentuh materi IELTS.
- **Secondary — admin konten** yang menyusun passage, bank soal, dan paket ujian. Pekerjaannya teliti dan berulang; kesalahan konten langsung merugikan nilai siswa.

## Product Purpose

IELTS Vibe membawa pelajar dari fondasi bahasa Inggris sampai target band IELTS General Training, dengan simulasi ujian yang meniru format dan penilaian aslinya. Berhasil berarti siswa tahu persis posisinya (band per skill) dan tahu apa yang harus dikerjakan hari ini untuk mencapai target di tanggal tesnya.

## Positioning

- **Spesifik General Training, bukan Academic.** Reading GT 3 section dengan teks keseharian dan kerja, Writing Task 1 berupa surat, konversi band Reading GT yang lebih ketat — ditangani sebagai format tersendiri, bukan varian Academic.
- **Dua jalur paralel dalam satu akun:** English Basic to Hero (fondasi) dan English for IELTS General Training. Pelajar bebas memilih; tidak ada yang terkunci.
- **Jujur soal nilai.** Band Listening & Reading dihitung otomatis dari tabel konversi dan ditandai sebagai estimasi; band Writing & Speaking dari self-assessment ditandai *self-reported*. Tidak ada klaim nilai resmi.

## Operating Context

- Dipakai **mayoritas di laptop / PC**. Mock test dikerjakan dalam satu duduk panjang (hingga 165 menit untuk full test), layar penuh, dengan timer berjalan dan audio Listening.
- Seluruh antarmuka dalam **bahasa Inggris** (keputusan pengguna, 22 Sep 2026: ini situs belajar bahasa Inggris, jadi UI ikut menjadi paparan bahasa). Konten soal IELTS juga bahasa Inggris.
- Alur siswa: dashboard → pilih module → daftar mock test → detail → ujian (autosave, timer server) → review sebelum kumpul → hasil & pembahasan.
- Alur admin: passage → bank soal (6 tipe) → rakit paket per section → terbitkan (ditolak bila struktur tidak sesuai format GT).

## Capabilities and Constraints

- Tipe soal: Multiple Choice, Multiple Choice Complex, True/False/Not Given, Isian Singkat, Esai (Writing/Speaking), Pelabelan Denah. Enam tipe GT lain (Matching Headings, dll.) belum ada.
- Satuan penilaian adalah **mark**, bukan baris soal: Listening & Reading masing-masing 40 mark.
- Writing & Speaking belum dinilai (self-assessment direncanakan di Fase 1D); Speaking belum bisa merekam suara.
- Basic to Hero punya kurikulum 52 lesson (4 level; Beginner dibuka unit Parts of speech) dan learning path (Guided tanpa jadwal atau Scheduled 1–3 bulan) di `/basic`. Tes penempatan, rebalance mingguan otomatis, dan quotes motivasi **belum dibangun**.
- Stack: Next.js 16 App Router, Tailwind 4, shadcn/radix; backend Express + Prisma + MariaDB.

## Brand Commitments

- Nama produk: **IELTS Vibe**.
- **Referensi visual yang dipilih pengguna: monday.com** (design system Vibe), dijalankan apa adanya dengan kerapian penuh. Pilihan ini sudah tampak sebelumnya di token `mon-*` pada `globals.css`.
- Ilustrasi karakter 3D berseragam kru per skill (`public/assets/icons/`) **dipertahankan** sebagai aset merek.
- Yang harus dihindari: kesan software kantor yang kaku, dan kesan situs bimbel lokal yang ramai.
- Belum ada logo resmi.

## Evidence on Hand

- Konten seed nyata: 4 paket terbit (1 full test, 3 latihan per skill) di `ielts-be/scripts/seed-ielts.ts`.
- Audio Listening adalah **placeholder TTS**, bukan rekaman asli.
- Ilustrasi karakter per skill di `public/assets/icons/` dan avatar di `public/assets/images/avatars/`.
- `public/assets/images/kategori/*` berasal dari produk lain (tryout TKA) dan **bukan** aset IELTS Vibe.
- **Tidak ada**: testimoni, jumlah pengguna, tingkat kelulusan, harga, logo. Jangan mengarang satu pun.

## Product Principles

1. **Pembimbing, bukan etalase.** Pelajar mandiri tidak punya guru untuk bertanya; setiap layar harus menjawab "apa selanjutnya" tanpa bantuan.
2. **Ujian terasa seperti ujian.** Mock test meniru tekanan dan format ujian komputer IELTS — fokus, tenang, tanpa gangguan dekoratif.
3. **Angka yang jujur.** Setiap band menyebut asalnya (otomatis, estimasi, atau self-reported); tidak pernah dibesar-besarkan.
4. **General Training di depan.** Istilah, contoh, dan struktur mengikuti GT, bukan Academic.

## Accessibility & Inclusion

- Sesi panjang di depan layar: teks bacaan harus nyaman dibaca lama, kontras tinggi, dan tidak melelahkan mata.
- Semua kontrol ujian harus bisa dipakai dengan keyboard; audio punya kontrol yang jelas.
