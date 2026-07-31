# Client Storage & IndexedDB

Dokumen ini menjelaskan pengelolaan penyimpanan lokal client di **BozuNovel** melalui [src/lib/indexeddb.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/src/lib/indexeddb.ts).

---

## 🗄 Desain Database IndexedDB (`BozuNovelDB`)

Aplikasi menggunakan database IndexedDB browser bernama `BozuNovelDB` (versi 3) untuk menyimpan status pembaca tanpa membutuhkan autentikasi server.

### Object Stores & Indeks

1. **`bookmarks`** (Key path: `id`)
   - Menyimpan daftar novel yang ditandai sebagai favorit/bookmark oleh pengguna.
   - Schema:
     ```typescript
     interface Bookmark {
       id: string;        // ID Series
       title: string;     // Judul Series
       cover: string;     // URL Cover
       url: string;       // Link relatif (/series/[id])
       createdAt: number; // Timestamp ditambahkan
     }
     ```

2. **`read_chapters`** (Key path: `id`)
   - Menyimpan status chapter yang telah dibaca.
   - Indeks: `seriesId` (non-unique) untuk mempermudah query seluruh chapter terbaca dalam satu series.

3. **`series_progress`** (Key path: `seriesId`)
   - Menyimpan chapter terakhir yang dibaca oleh pengguna pada series tertentu.
   - Digunakan untuk menampilkan tombol "Lanjutkan Membaca" di halaman Detail Series maupun Beranda.

---

## 🛠 Helper API Utama (`src/lib/indexeddb.ts`)

| Fungsi | Deskripsi | Return Type |
|---|---|---|
| `getBookmarks()` | Mengambil seluruh daftar bookmark diurutkan dari yang terbaru | `Promise<Bookmark[]>` |
| `toggleBookmark(bookmark)` | Menambah atau menghapus novel dari daftar bookmark | `Promise<boolean>` |
| `isBookmarked(id)` | Memeriksa apakah suatu series ada di bookmark | `Promise<boolean>` |
| `markChapterAsRead(...)` | Menandai chapter tertentu sebagai "sudah dibaca" | `Promise<void>` |
| `isChapterRead(id)` | Memeriksa apakah suatu chapter sudah pernah dibaca | `Promise<boolean>` |
| `saveSeriesProgress(...)` | Menyimpan progres chapter terakhir yang dibaca per series | `Promise<void>` |
| `getSeriesProgress(seriesId)` | Mengambil progres membaca terakhir untuk suatu series | `Promise<Progress \| null>` |

---

## 🔄 Keuntungan Pendekatan Client-Storage

1. **Zero Latency**: Pembacaan status favorit & progres membaca terjadi instan tanpa menunggu request jaringan.
2. **Offline Resilience**: Pengguna dapat melihat daftar bookmark dan chapter yang tersimpan bahkan saat koneksi internet terputus.
3. **Privasi 100%**: Tidak ada pelacakan server atau pengumpulan data pengguna.
