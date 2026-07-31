# Optimasi Usage Vercel & Static Export

Dokumen ini berisi penjelasan ringkas mengenai strategi pemangkasan biaya dan pembatasan pemakaian resource Vercel pada proyek **BozuNovel**.

---

## 🎯 Masalah Usage Awal

Pada versi awal aplikasi Next.js:
- Halaman Server Component melakukan data fetching langsung di server saat request masuk atau pada saat build.
- `generateStaticParams` pada halaman `/ch/[chapterId]` melakukan fetching seluruh postingan chapter (ribuan request) pada saat build time, menyebabkan build sangat lambat dan meningkatkan usage Vercel.
- Hal ini menyebabkan tingginya **ISR Writes**, **ISR Reads**, **Function Invocations**, dan **Fluid CPU Usage** di dashboard Vercel, karena Next.js mendeploy halaman tersebut sebagai Vercel Serverless Function.

---

## 💡 Solusi: Static Export Murni (`output: 'export'`) & CSR Reader

Untuk memangkas usage Vercel hingga 0 Function Invocation dan 0 ISR Writes:

1. **Konfigurasi `next.config.ts`**:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
     allowedDevOrigins: ['192.168.43.137'],
   };

   export default nextConfig;
   ```

2. **Optimasi Rute Chapter (`src/app/ch/[chapterId]/page.tsx`)**:
   - `generateStaticParams()` di rute `/ch` mengembalikan static placeholder tunggal `[{ chapterId: "index" }]` tanpa memanggil WordPress API sama sekali pada build-time.
   - Hasil build untuk rute chapter bersifat instan (hanya 1 HTML shell statis).

3. **Transisi ke Client-Side Rendering (CSR)**:
   - Halaman utama (`page.tsx`) dan halaman detail (`/series/[id]`, `/ch/[chapterId]`, `/search`, `/bookmarks`) dijadikan shell statis non-async.
   - Proses pengambil data dari WordPress REST API dipindahkan sepenuhnya ke Client Components (`HomeClient`, `SeriesClient`, `ChapterClient`, `SearchClient`, `BookmarksClient`) menggunakan `useEffect` / async client fetching.
   - `ChapterClient` mengambil ID postingan (`postId`) dari URL path, men-fetch postingan dari WordPress REST API di browser, mengekstrak metadata JSON tersembunyi (`<pre id="chapter-meta">`), dan memperbarui URL bar secara otomatis via `window.history.replaceState()`.

---

## 📋 Hasil & Keuntungan Optimasi

| Metric Vercel | Sebelum Optimasi | Sesudah Static Export + CSR Reader |
|---|---|---|
| **Function Invocations** | Tinggi (setiap request halaman) | **0** (tidak ada Serverless Function) |
| **ISR Writes / Reads** | Terus membengkak | **0** (tidak ada revalidation server) |
| **Build Time / Loop Fetching** | Lambat & Ribuan Request | **Instan (~2.7 detik untuk static generation)** |
| **Edge Requests** | Terhitung per request function | **Terbatas pada Static CDN Assets** |
| **Biaya Hosting** | Berpotensi melewati Free Tier | **100% Gratis / Zero Cost** |

---

## ⚠️ Konsekuensi Static Export yang Perlu Diperhatikan

- **`next/image` Remote Optimizer**: Tidak dapat dipakai di mode export statis tanpa custom loader. `images.unoptimized: true` diaktifkan agar browser memuat gambar langsung dari source (WordPress media).
- **No Middleware & Route Handlers**: Tidak menggunakan `middleware.ts` atau `/api/*` internal server routes.
- **Dynamic Content**: Novel atau chapter baru yang dipublikasikan di WordPress akan otomatis langsung terbaca oleh pengguna karena fetch dilakukan dari browser (CSR) ke WordPress REST API.
