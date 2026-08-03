# Rencana Perbaikan Vercel Usage (Next.js 16)

## TL;DR

Analisis awal di dokumen kamu **sudah benar secara arah**: usage (ISR Writes,
ISR Reads, Function Invocations, Edge Requests, Fluid Active CPU, Fluid
Provisioned Memory, Fast Origin/Data Transfer) muncul karena project ini
**masih punya banyak Server Component yang melakukan data fetching**,
padahal niatnya sudah "static + CSR". Next.js secara default akan tetap
mendeploy apapun yang tidak murni static sebagai Vercel Function — bukan
static file biasa.

Yang perlu ditambahkan dari analisis sebelumnya: **beberapa fix yang
diusulkan (khususnya menghapus `generateStaticParams` di halaman dynamic
route) justru tidak valid kalau kamu benar-benar pakai `output: 'export'`.**
Di mode static export, setiap dynamic route (`[id]`, `[chapterId]`) justru
**wajib** punya `generateStaticParams` yang mengembalikan semua path yang
ingin di-generate — karena tidak ada server yang bisa melakukan SSR
on-demand untuk path yang belum di-generate. Detail lengkap di bawah.

---

## 1. `next.config.ts` — Tambahkan `output: 'export'`

**Status:** Prioritas tertinggi, sudah benar di analisis awal.

- Tambahkan `output: 'export'`.
- Efeknya: build menghasilkan folder `out/` berisi HTML/CSS/JS statis murni,
  tidak ada Vercel Function sama sekali untuk seluruh app.
- **Konsekuensi yang harus diperiksa sebelum aktifkan opsi ini** (fitur-fitur
  ini otomatis tidak jalan / perlu disesuaikan di mode export):
  - `next/image` dengan optimizer bawaan Vercel **tidak bisa dipakai** —
    harus set `images: { unoptimized: true }` di `next.config.ts`, atau pakai
    custom loader eksternal (misalnya Cloudinary/imgix).
  - **Middleware (`middleware.ts`) tidak berjalan** di static export. Jika
    project ini punya middleware apa pun (auth check, redirect, i18n, dsb),
    itu harus dipindah ke client-side logic atau dihapus.
  - **Route Handlers (`app/api/**/route.ts`) tidak berjalan** di static
    export — kalau ada endpoint API internal di project ini, itu perlu
    dipindah ke layanan lain (mis. Cloudflare Worker, backend terpisah) atau
    dipanggil langsung ke WP API dari client.
  - ISR/ on-demand revalidation otomatis tidak berlaku (memang itu tujuannya).

**Yang perlu dicek:** apakah project ini punya `middleware.ts` atau folder
`app/api/`? Kalau ada, itu harus diinventarisasi dulu sebelum
`output: 'export'` diaktifkan, karena keduanya akan berhenti berfungsi.

---

## 2. `src/app/page.tsx` — Home page, hilangkan data fetching di server

Sama seperti analisis awal: jadikan `page.tsx` non-async, hapus semua
`await getCategoryId(...)`, `await getSeriesByCategory(...)`, dan pindahkan
fetch tersebut ke `HomeClient` (client component, via `useEffect` atau
data-fetching library seperti SWR/React Query).

Ini menghilangkan ISR Writes yang selama ini terjadi di home page — ini
kemungkinan besar kontributor terbesar ke usage yang kamu lihat sekarang,
sesuai laporan pengguna lain yang mengalami ISR Writes sangat tinggi akibat
data fetching di server component yang di-cache.

---

## 3. `src/app/series/[id]/page.tsx` — Perlu perlakuan khusus, BUKAN sekadar "jadikan CSR"

Ini bagian yang **perlu dikoreksi** dari rencana awal. Ada dua opsi berbeda,
pilih salah satu — jangan gabung setengah-setengah:

### Opsi A — Full static export (`output: 'export'`)
- `generateStaticParams()` **tetap wajib ada**, dan harus mengembalikan
  **SEMUA** id series yang ada (bukan cuma 100), karena di static export
  tidak ada fallback SSR untuk path yang belum di-generate — path yang
  tidak ada di `generateStaticParams` akan menghasilkan **404**, bukan
  fetch on-demand.
- `generateMetadata()` boleh tetap dipakai karena berjalan di build time
  (tidak dihitung sebagai runtime function invocation), tapi kalau jumlah
  series sangat banyak, ini akan memperlambat build secara signifikan.
- Data konten utama (bukan metadata) tetap boleh dipindah fetch-nya ke
  client (`SeriesClient`) kalau mau update lebih real-time tanpa rebuild.
- **Trade-off:** setiap ada series baru dari WP, perlu **redeploy/rebuild**
  supaya halamannya ter-generate. Kalau frekuensi series baru tinggi, opsi
  ini kurang cocok.


**Keputusan yang perlu diambil dulu:** apakah semua series/chapter memang
bisa diketahui penuh saat build (cocok untuk Opsi A), atau series baru
sering muncul dan halaman harus langsung bisa diakses tanpa rebuild (perlu
Opsi B, dan berarti sebagian kecil usage Vercel memang tidak bisa dihindari
seluruhnya, hanya diminimalkan).

---

## 4. `src/app/series/[id]/ch/[chapterId]/page.tsx` — Sama seperti poin 3

Halaman ini sudah CSR di komponennya, tapi kalau memilih Opsi A (static
export) di atas, dynamic route ini juga **wajib** punya
`generateStaticParams` sendiri yang mencakup semua kombinasi
`id` + `chapterId` yang valid — jangan asumsikan cukup dengan `"use client"`
saja, karena shell HTML-nya tetap perlu di-generate untuk tiap path di mode
export.

---

## 5. `src/app/search/page.tsx` — Tambahkan `"use client"`

Sesuai analisis awal. Catatan tambahan: kalau halaman ini pakai
`searchParams` dari server (misalnya untuk baca query `?q=...`), setelah
jadi `"use client"`, baca query string itu di client lewat
`useSearchParams()` dari `next/navigation`, bukan lewat props `searchParams`
server.

---

## 6. `src/app/bookmarks/page.tsx` — Tambahkan `"use client"`

Sesuai analisis awal, tidak ada catatan tambahan — halaman ini sudah benar
arahnya.

---

## 7. `src/app/sitemap.ts` — Cocokkan dengan keputusan `output: 'export'`

- Kalau pakai `output: 'export'` (Opsi A di poin 3): `sitemap.ts` otomatis
  jadi file statis yang digenerate sekali saat build — tidak ada runtime
  cost, tidak perlu `revalidate`.
- Kalau tetap ISR (Opsi B): tambahkan `export const revalidate = 86400`
  seperti disebutkan di analisis awal, supaya sitemap tidak
  di-regenerate di setiap request.
- Independen dari pilihan di atas: kurangi jumlah request loop-fetch ke WP
  API saat build (mis. gunakan endpoint yang mengembalikan semua ID
  sekaligus, bukan looping per halaman 100 post) agar build time tidak
  membengkak.

---

## 8. `src/lib/wp.ts` — `decodeHtmlEntities` pakai `document` di server

Sesuai analisis awal — bug, bukan penyebab usage, tapi tetap perlu
diperbaiki (ganti dengan library seperti `he`, atau regex/DOMParser
polyfill yang jalan di server maupun client) supaya data yang sempat
di-fetch di server (kalau Opsi B dipilih) tidak rusak.

---

## 9. `src/lib/wp.ts` — Konsolidasi cache strategy

Sesuai analisis awal: setelah data fetching dipindah ke client, pertimbangkan
`cache: 'no-store'` untuk semua fetch di client. Tambahan: kalau mau data
tetap agak di-cache di browser (supaya tidak fetch ulang tiap navigasi),
pertimbangkan pakai library client cache (SWR/React Query) daripada
`fetch` cache bawaan Next.js — supaya caching tetap ada tapi murni di
browser, tidak menyentuh Vercel sama sekali.

---

## 10. Hal baru yang perlu dicek (belum ada di analisis awal)

- **`middleware.ts`** — cek apakah project ini punya file ini di root. Kalau
  ada, ini menjalankan Edge Function di **setiap request**, termasuk request
  ke asset statis seperti `favicon.ico` kalau matcher-nya tidak dibatasi —
  ini salah satu penyebab Edge Requests yang sering tidak disadari orang.
  Kalau target akhirnya `output: 'export'`, middleware harus dihapus total
  atau logikanya dipindah ke client.
- **`app/api/**/route.ts`** — cek apakah ada Route Handler API internal.
  Sama seperti middleware, ini tidak berjalan di static export dan tiap
  panggilannya di mode saat ini terhitung Function Invocation.
- **`next/image` remote loader** — kalau pakai `<Image src="https://...">`
  dari WP tanpa `unoptimized: true`, tiap gambar unik yang diminta browser
  memicu Image Optimization API (masuk kategori Function Invocations /
  Fast Origin Transfer). Ini sering jadi kontributor besar yang tidak
  disadari karena "kelihatannya" cuma gambar statis.
- **Vercel Analytics / Speed Insights script** (kalau dipakai) — ini murni
  client-side, aman, tidak perlu diubah.
- **Next.js 16 + Cache Components / PPR** — ada laporan dari komunitas bahwa
  walau seluruh Server Component sudah non-async dan tidak pakai `use cache`,
  Active CPU tetap tercatat di dashboard Vercel ketika `cacheComponents: true`
  diaktifkan di `next.config.ts`. Ini masih jadi diskusi terbuka di GitHub
  Next.js per pertengahan 2026. **Yang perlu dicek:** apakah
  `cacheComponents: true` (atau PPR) aktif di `next.config.ts` project ini —
  kalau target akhirnya benar-benar static export, opsi ini sebaiknya
  dinonaktifkan/tidak relevan, karena `output: 'export'` dan
  Cache Components/PPR pada dasarnya untuk skenario yang berbeda (PPR untuk
  hybrid static+dynamic di server, bukan untuk full static export).

---

## Ringkasan Prioritas (diperbarui)

| Prioritas | Item | Catatan |
|---|---|---|
| **Tertinggi** | Putuskan dulu: Opsi A (`output: 'export'` penuh) vs Opsi B (tetap Vercel Functions tapi diminimalkan) | Keputusan ini menentukan semua langkah selanjutnya |
| **Tinggi** | Cek keberadaan `middleware.ts` dan `app/api/**` | Keduanya tidak kompatibel dengan Opsi A |
| **Tinggi** | `next.config.ts`: `output: 'export'` + `images.unoptimized: true` (jika Opsi A) | |
| **Tinggi** | `page.tsx` (home): hapus async/data fetching server, pindah ke `HomeClient` | |
| **Tinggi** | `series/[id]/page.tsx`: sesuaikan `generateStaticParams` dengan Opsi A/B yang dipilih, JANGAN dihapus begitu saja kalau pilih Opsi A | Koreksi dari rencana awal |
| **Tinggi** | `series/[id]/ch/[chapterId]/page.tsx`: pastikan `generateStaticParams` mencakup semua kombinasi (jika Opsi A) | Poin baru |
| **Sedang** | `search/page.tsx`, `bookmarks/page.tsx`: tambahkan `"use client"` | |
| **Sedang** | Cek pemakaian `next/image` dengan remote source WP | Poin baru |
| **Rendah** | `sitemap.ts`: sesuaikan dengan Opsi A/B | |
| **Rendah** | Perbaiki `decodeHtmlEntities` | |
| **Rendah** | Cek `cacheComponents`/PPR di `next.config.ts` | Poin baru, khusus Next.js 16 |

---

## Catatan Penting

Kalau memang tujuannya "tidak mau kena biaya usage Vercel sama sekali",
jawaban paling aman dan pasti adalah **Opsi A: `output: 'export'` penuh**,
karena itu satu-satunya cara yang membuat Vercel benar-benar hanya
menyajikan file statis tanpa Function apapun. Tapi ini datang dengan
konsekuensi: series/chapter baru tidak akan otomatis muncul tanpa rebuild,
middleware dan API routes internal (kalau ada) harus dihapus/dipindah, dan
`next/image` optimizer tidak bisa dipakai.

Kalau kebutuhan bisnisnya adalah series baru harus langsung tampil tanpa
rebuild manual, maka sebagian kecil usage Vercel (ISR Reads, sedikit
Function Invocations untuk halaman detail series) memang **tidak bisa
dihilangkan 100%** — hanya bisa diminimalkan lewat `revalidate` yang lebih
panjang dan pembatasan `generateStaticParams`.
