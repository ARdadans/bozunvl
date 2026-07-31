# Arsitektur Sistem BozuNovel

Dokumen ini menjelaskan rancangan arsitektur teknis, aliran data, dan struktur rute proyek **BozuNovel**.

---

## 🏗 High-Level Architecture

BozuNovel dirancang sebagai aplikasi **Jamstack Modern & Progressive Reader** berbasis **Next.js 16 (App Router)** yang menggunakan WordPress.com REST API v2 sebagai Headless CMS.

```
┌──────────────────────────────────────────────────────────┐
│                   WordPress REST API                     │
│           (public-api.wordpress.com/wp/v2)               │
└────────────────────────────┬─────────────────────────────┘
                             │ (HTTPS / JSON)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                    BozuNovel Frontend                    │
│      Next.js 16 (Static Export / Client-side Hydrated)    │
├────────────────────────────┬─────────────────────────────┤
│   App Router Pages         │  Client Components          │
│   - Home (CSR)             │  - HomeClient               │
│   - Series Detail (CSR)    │  - SeriesClient             │
│   - Chapter Reader (CSR)   │  - ChapterClient            │
│   - Search / Filter (CSR)  │  - BookmarksClient          │
│   - Bookmarks (CSR)        │                             │
└────────────────────────────┴──────────────┬──────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────┐
│              Browser Client-Side Storage                 │
│   - IndexedDB (BozuNovelDB: Bookmarks, History, Progress)│
│   - IndexedDB (bozunovel-db: WordPress API Cache)       │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Aliran Data (Data Flow)

1. **Static HTML/JS Bundle Loading**:
   - Aplikasi di-build dengan mode `output: 'export'` di [next.config.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/next.config.ts).
   - CDN (seperti Vercel atau Cloudflare Pages) menyajikan bundle statis murni tanpa Server-Side Rendering (SSR) runtime atau Serverless Functions.

2. **Client-Side Data Fetching**:
   - Saat pengguna membuka halaman (Homepage, Detail Series, atau Reader Chapter), Komponen Client (`"use client"`) melakukan fetch data asynchronous langsung dari WordPress REST API via [src/lib/wp.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/src/lib/wp.ts).

3. **Client-Side Caching (IndexedDB)**:
   - Data post/series yang telah di-fetch disimpan sementara di IndexedDB (`bozunovel-db`) untuk mempercepat navigasi berikutnya dan mengurangi beban request berulang.

4. **Reader State & Local Storage**:
   - Bookmark novel, riwayat pembacaan chapter terakhir, dan progres membaca disimpan secara penuh di IndexedDB client (`BozuNovelDB`) via [src/lib/indexeddb.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/src/lib/indexeddb.ts).

---

## 📂 Struktur App Router & Format Rute

Rute aplikasi disusun menggunakan **Next.js App Router**:

| Rute | File Utama | Deskripsi | Jenis Rendering |
|---|---|---|---|
| `/` | `src/app/page.tsx`, `HomeClient.tsx` | Beranda: Carousel kategori, rilis terbaru, populer | Static Shell + CSR |
| `/series/[id]` | `src/app/series/[id]/page.tsx`, `SeriesClient.tsx` | Detail Series: Sinopsis, daftar chapter, bookmark | Static Shell + CSR |
| `/ch/[chapterId]` | `src/app/ch/[chapterId]/page.tsx`, `ChapterClient.tsx` | Reader Chapter: Isi bacaan, toolbar font/tema | Static Shell + CSR |
| `/search` | `src/app/search/page.tsx`, `SearchClient.tsx` | Pencarian & Filter genre/status | Static Shell + CSR |
| `/bookmarks` | `src/app/bookmarks/page.tsx`, `BookmarksClient.tsx` | Daftar Novel yang ditandai (Bookmarks) | Static Shell + CSR |

### 📌 Format URL Chapter Kanonikal
Halaman Reader Chapter (`/ch/[chapterId]`) menggunakan struktur URL deskriptif:

`/ch/{series.id}-{series.title(kebabcase)}-chapter-{chapter.number}-{chapterpost.id}`

- **Contoh**: `/ch/368-fullmetal-alchemist-chapter-3-371`
- **Mekanisme Client-Side Auto-Correction**:
  - `ChapterClient` mengambil ID postingan (`postId`) dari bagian paling belakang URL path (e.g. `371`).
  - Setelah data dan metadata `<pre id="chapter-meta" hidden>` di-fetch dari WordPress API, client membandingkan URL di browser.
  - Jika URL path awal tidak lengkap atau berbeda (misal `/ch/371`), client akan secara otomatis memperbarui URL bar browser ke format kanonikal tanpa melakukan reload halaman via `window.history.replaceState()`.

---

## 🔐 Keamanan & Privasi Pengguna

- **Tanpa Backend Server Tradisional**: Aplikasi tidak memiliki server backend tersendiri dan tidak menyimpan data pengguna di server.
- **Client-First Privacy**: Seluruh riwayat membaca, preferensi tema, dan daftar favorit disimpan secara lokal di browser pengguna (IndexedDB).
