---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: ["src/features","src/_global"]
---

# Surface brief — seluruh aplikasi IELTS Vibe

Scope: semua halaman siswa (landing, auth, dashboard, /basic, /ielts, mock test, materi lama) dan admin (shell, overview, passage, bank soal, paket, materi, user).
Visitor mode: Operate. Siswa dan admin datang untuk menyelesaikan tugas.

Audience & job: pelajar mandiri (laptop) mengerjakan dan melacak persiapan IELTS GT; admin menyusun konten ujian.
Constraints: ilustrasi karakter kru per skill dipertahankan; hindari kesan kantor kaku dan bimbel ramai; mock test tetap bebas gangguan.

## Direction contract

THESIS: IELTS Vibe tampil sebagai "work OS" untuk belajar: semua yang perlu dikerjakan siswa dan admin hadir sebagai board ala monday.com — grup berpita warna, status terbaca dari warna sel. Menolak dashboard edtech (kartu mengambang, cincin progres, gradasi cyan-ungu, kaca blur, emoji).

OWN-WORLD: chrome abu-abu terang #F6F7FB; area kerja berupa panel putih membulat 16px di pojok kiri-atas. Teks #323338, sekunder #676879, garis #D0D4E4. Satu aksen aksi: biru #0073EA. Warna label monday hanya untuk skill (Listening #FF642E, Reading #BB3354, Writing #2B76E5, Speaking #784BD1, Basic #00C875) dan status (selesai #00C875, berjalan #FDAB3D, bermasalah #E2445C, belum #C4C4C4). Poppins untuk judul, Figtree untuk UI. Tombol radius 4px, tinggi 40/32px. Tabel board: pita 6px di kiri grup, pill status mengisi sel penuh, baris 40px. Ilustrasi karakter tampil sebagai avatar bulat di kolom "Pemandu", seperti kolom People di monday.

STORY: siswa melihat semua tesnya sebagai board — grup per module, status dan band terbaca sekilas — lalu satu klik untuk mulai. Hasil ujian adalah board soal dengan status benar/salah per baris. Admin mengelola konten seperti mengelola board kerja.

FIRST VIEWPORT (dashboard): sidebar kiri 248px (wordmark IELTS Vibe, Home, module IELTS GT & Basic, Mock Test, akun); topbar tipis dengan pencarian dan avatar. Panel putih: sapaan Poppins 28px dengan tanggal, strip ringkasan (tes selesai, band terbaik, sedang berjalan) sebagai readout angka; lalu board "Tes saya": grup IELTS GT (pita biru) dengan baris per paket — kolom Pemandu (avatar karakter), Skill (pill), Status (pill penuh), Band, Durasi, dan tombol biru "Mulai" di baris. Grup Basic to Hero (pita hijau) dengan status "Segera hadir".

SIGNATURE INTERACTION: baris board dengan hover abu-abu dan aksi yang muncul saat hover; battery bar per grup (bar tersegmen menurut komposisi status). Motion: transisi 150ms ease-out, tanpa animasi dekoratif.

FORM: kanon kategori yang dipilih pengguna dengan kata-kata — monday.com (Vibe design system); bukan dari daftar yang diacak. Seed key d9c4bdce (dipilih: canon).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
