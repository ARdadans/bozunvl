# BozuNovel Documentation Index

Selamat datang di pusat dokumentasi resmi proyek **BozuNovel** (Web Novel & Light Reader Platform berbasis Next.js 16 App Router & Headless WordPress REST API).

---

## 📑 Daftar Isi Dokumentasi

1. **[Arsitektur Sistem (architecture.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/architecture.md)**
   - Gambaran umum arsitektur proyek (Static Export + Client-Side Hydrated CSR).
   - Pola Data Flow (Headless WordPress REST API -> Next.js Static Export -> Client-side Storage).
   - Struktur App Router, hirarki rute, dan format URL Chapter kanonikal (`/ch/{series.id}-{series.title}-chapter-{chapter.number}-{chapterpost.id}`).

2. **[Panduan Memulai (getting-started.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/getting-started.md)**
   - Prasyarat sistem & environment.
   - Cara menjalankan dev server (`npm run dev`) & perintah build static export (`npm run build`).
   - Panduan konfigurasi variabel lingkungan `.env.local` dan preview lokal (`npx serve out`).

3. **[Integrasi API WordPress (api-integration.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/api-integration.md)**
   - Detail fungsi-fungsi di `src/lib/wp.ts` termasuk `buildChapterUrl()`.
   - Pemetaan data WordPress REST API v2 (Category/Tag sebagai Series, Post sebagai Chapter).
   - Parsing metadata `<pre id="chapter-meta" hidden>` JSON, penanganan HTML Entity decoding, dan error fallback.

4. **[Penyimpanan Lokal / Client Storage (client-storage.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/client-storage.md)**
   - Arsitektur IndexedDB melalui `src/lib/indexeddb.ts` (`BozuNovelDB` v3) dan cache internal `bozunovel-db`.
   - Fitur Bookmarks, Reading History (Terakhir Dibaca), dan Series Progress tracking.
   - Manajemen pembacaan tanpa memerlukan registrasi user / backend database server.

5. **[Komponen UI & Design System (components.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/components.md)**
   - Hirarki komponen UI di `src/components/`.
   - Komponen Situs (`Header`, `Footer`), Komponen Novel (`SeriesCard`, `SeriesHeader`, `ChapterList`), Komponen Pembaca (`Reader`).
   - Integrasi Tailwind CSS v4, Base UI, Radix UI, lucide-react, dan shadcn/ui.

6. **[Optimasi Usage Vercel & Static Export (vercel-optimization.md)](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/vercel-optimization.md)**
   - Strategi pemangkasan biaya & pembatasan pemakaian resource Vercel hingga 0 Server Function / 0 ISR Writes.
   - Penerapan `output: 'export'` dan `images: { unoptimized: true }` di `next.config.ts`.
   - Rute `/ch/[chapterId]` CSR murni tanpa loop-fetching API pada build-time (`generateStaticParams` return placeholder).

---

## 🛠 File Konfigurasi Penting

- **[AGENTS.md](file:///d:/Project_/2026/js/nextjs/bozunovel/AGENTS.md)**: Panduan & aturan wajib untuk AI agent / pengembang.
- **[CLAUDE.md](file:///d:/Project_/2026/js/nextjs/bozunovel/CLAUDE.md)**: Ringkasan instruksi & perintah proyek untuk Claude CLI / Subagent.
- **[README.md](file:///d:/Project_/2026/js/nextjs/bozunovel/README.md)**: Landing page dokumentasi repository utama.
- **[rencana-perbaikan-vercel-usage.md](file:///d:/Project_/2026/js/nextjs/bozunovel/rencana-perbaikan-vercel-usage.md)**: Dokumen analisis dan rekomendasi Vercel usage.
