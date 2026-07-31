# Panduan Memulai (Getting Started)

Panduan ini berisi langkah-langkah untuk menyiapkan environment lokal, menjalankan server pengembangan, dan membuat build produksi statis untuk proyek **BozuNovel**.

---

## 📋 Prasyarat Sistem

Sebelum memulainya, pastikan komputer Anda telah terinstal:
- **Node.js**: v18.17.0 atau lebih baru (direkomendasikan v20+)
- **Package Manager**: `npm` (atau `pnpm`, `yarn`, `bun`)
- **Git**

---

## 🚀 Langkah Instalasi

1. **Clone Repository / Buka Directory Project**:
   ```bash
   cd d:/Project_/2026/js/nextjs/bozunovel
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan (`.env.local`)**:
   Buat file `.env.local` di root proyek (jika belum ada):
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

---

## 💻 Menjalankan Development Server

Untuk mulai mengembangkan aplikasi dengan dukungan Hot Module Replacement (HMR):

```bash
npm run dev
```

Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 🏗 Membangun untuk Produksi (Static Export)

Proyek ini telah dikonfigurasi menggunakan **Static Export** (`output: 'export'`).

1. **Jalankan perintah Build**:
   ```bash
   npm run build
   ```

2. **Hasil Build**:
   - Next.js akan menghasilkan folder `out/` di root proyek yang berisi file HTML, CSS, dan JS statis murni.
   - Folder `out/` ini siap di-deploy ke hosting statis mana pun seperti Vercel, Cloudflare Pages, Netlify, GitHub Pages, atau server Nginx/Apache.

3. **Uji Coba Preview Hasil Export**:
   Untuk menguji file di dalam folder `out/` secara lokal:
   ```bash
   npx serve out
   ```

---

## 🔍 Linting & Pengecekan Kode

Untuk memeriksa potensi kesalahan kode dan kepatuhan aturan ESLint:

```bash
npm run lint
```
