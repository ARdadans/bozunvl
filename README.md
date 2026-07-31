# 📖 BozuNovel — Modern Web Novel & Light Novel Reader

**BozuNovel** adalah platform pembaca web novel dan light novel Jepang & Korea berbahasa Indonesia yang dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, dan **WordPress.com REST API** sebagai Headless CMS.

Aplikasi ini dirancang dengan arsitektur **Static Export (`output: 'export'`)** dan **Client-Side Storage (IndexedDB)** sehingga menawarkan performa sangat cepat, zero server latency, dukungan offline awal, serta efisiensi biaya hosting 100% (Zero Vercel Function Cost).

---

## ✨ Fitur Utama

- 📚 **Katalog Novel Lengkap**: Mendukung novel Jepang (*Shōsetsu*, *Raito Noberu*) dan Korea (*Soseol*, *Wepsoseol*) langsung dari raw / terjemahan Indonesia.
- 📖 **Pengalaman Membaca Optimal (Reader Toolbar)**:
  - Pengatur ukuran font, tipe font, serta jarak antar baris (*line-height*).
  - Pilihan tema latar belakang pembaca (Light, Sepia, Dark).
  - Indikator progres membaca dan navigasi chapter sebelumnya / berikutnya yang responsif.
- 📑 **Bookmark & History (IndexedDB)**:
  - Menandai novel favorit tanpa perlu login/registrasi.
  - Otomatis mencatat chapter terakhir yang dibaca (*Lanjutkan Membaca*).
- 🔍 **Pencarian & Filter Canggih**: Filter berdasarkan judul, kategori, status (Ongoing/Completed), atau genre.
- 🔗 **Rute Chapter Kanonikal & Auto-Correction**:
  - Format URL deskriptif: `/ch/{series.id}-{series.title(kebabcase)}-chapter-{chapter.number}-{chapterpost.id}`.
  - Client secara otomatis mengoreksi rute URL di browser bar via `window.history.replaceState()` tanpa reload halaman.
- ⚡ **Optimasi Vercel Zero-Cost**:
  - Di-build sebagai Static Export murni (`output: 'export'`).
  - Menghilangkan ISR Writes & Serverless Function Invocations di Vercel (rute `/ch` mengembalikan static shell tanpa build-time loop fetching).
- 🌓 **Dukungan Dark Mode**: Tema gelap dan terang yang nyaman untuk mata saat membaca malam hari.

---

## 🛠 Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Base UI, Radix UI Primitives, shadcn/ui |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Headless CMS** | WordPress.com REST API v2 |
| **Penyimpanan Local** | IndexedDB (`BozuNovelDB` & `bozunovel-db`) |

---

## 🚀 Panduan Memulai

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Jalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 3. Build Static Export (Produksi)

```bash
npm run build
```

Hasil build statis akan tersimpan di dalam folder `out/` dan siap di-deploy ke Vercel, Cloudflare Pages, atau hosting statis apa pun.

---

## 📂 Struktur Proyek

```
bozunovel/
├── docs/                        # Dokumentasi teknis proyek
│   ├── INDEX.md                 # Master indeks dokumentasi
│   ├── architecture.md          # Arsitektur sistem & aliran data
│   ├── getting-started.md       # Panduan instalasi & build
│   ├── api-integration.md       # Integrasi WordPress REST API
│   ├── client-storage.md        # Dokumentasi IndexedDB
│   ├── components.md            # Panduan komponen & design system
│   └── vercel-optimization.md   # Strategi optimasi Vercel usage
├── src/
│   ├── app/                     # Next.js App Router (Pages & Layouts)
│   ├── components/              # Komponen UI (Header, Footer, Reader, Series, UI)
│   ├── config/                  # Konfigurasi situs (site.ts)
│   └── lib/                     # Utilities (wp.ts, indexeddb.ts, utils.ts)
├── AGENTS.md                    # Aturan agen pengembang / AI
├── CLAUDE.md                    # Instruksi cepat untuk Claude AI
├── next.config.ts               # Konfigurasi Next.js static export
└── package.json
```

---

## 📚 Dokumentasi Lengkap

- 📖 [Dokumentasi Lengkap di folder `docs/`](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/INDEX.md)
- 🤖 [Aturan Pengembang (AGENTS.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/AGENTS.md)
- 🤖 [Panduan Claude (CLAUDE.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/CLAUDE.md)
- 📊 [Rencana Perbaikan Usage Vercel](file:///d:/Project_/2026/js/nextjs/bozunovel/rencana-perbaikan-vercel-usage.md)
