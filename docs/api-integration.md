# Integrasi API WordPress

Dokumen ini menjelaskan detail fungsi-fungsi integrasi API, struktur pemetaan data dari WordPress REST API v2, dan modul pembantu di [src/lib/wp.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/src/lib/wp.ts) serta [src/config/site.ts](file:///d:/Project_/2026/js/nextjs/bozunovel/src/config/site.ts).

---

## ⚙️ Konfigurasi Situs (`src/config/site.ts`)

File `site.ts` mengatur parameter utama koneksi ke situs WordPress:

```typescript
export const SITE = {
  NAME: "dhadhankun.wordpress.com",
  ID: 189902096,
  API_REST: "https://public-api.wordpress.com/wp/v2/sites",
  PER_PAGE: 24,
  POPULAR_POST_ID: 396,
  POPULAR_POST_ID_TTL_SECONDS: 7200,
  LAST_READ_MAX_POSTS: 100,
} as const;
```

---

## 🗺 Pemetaan Model Data (WordPress -> BozuNovel)

WordPress REST API v2 dipetakan ke struktur web novel sebagai berikut:

| Konsep Novel | Endpoint / Resource WordPress | Properti Utama |
|---|---|---|
| **Series / Novel** | Category / Tag / Post Meta | `id`, `title`, `cover`, `description`, `genres`, `status`, `rating` |
| **Chapter** | WordPress Post (`/posts/{postId}`) | `id`, `title`, `number`, `publishedAt`, `wordCount`, `content` |
| **Popular Novels** | Custom Page / Post (ID: 396) | List ID novel terpopuler yang diisi secara dinamis/manual |

---

## 📄 Metadata Hidden Chapter (`<pre id="chapter-meta">`)

Setiap postingan chapter di WordPress menyertakan tag HTML tersembunyi berformat JSON berisi metadata navigasi:

```html
<pre id="chapter-meta" hidden>
{
  "next": { "chapter": 4, "postId": 372 },
  "previous": { "chapter": 2, "postId": 370 },
  "series": "Fullmetal Alchemist",
  "seriesId": 368,
  "seriesUrl": "/series/368-fullmetal-alchemist",
  "chapter": 3
}
</pre>
```

- Modul `ChapterClient` mengekstrak tag ini menggunakan RegEx di client-side.
- Metadata ini dipakai untuk membentuk link rute chapter kanonikal, link Next/Prev chapter, serta link kembali ke Series Detail.

---

## 🛠 Fungsi-Fungsi Utama (`src/lib/wp.ts`)

### 1. `buildChapterUrl(series, chapter)`
Membentuk string URL path kanonikal untuk chapter novel berdasarkan ID/Slug series, judul series, nomor chapter, dan ID postingan chapter (`postId`):
```typescript
buildChapterUrl(
  series: { id: string | number; title?: string; slug?: string; seriesUrl?: string },
  chapter: { id: string | number; number: number | string }
): string
```
*Hasil*: `/ch/368-fullmetal-alchemist-chapter-3-371`

### 2. `getSeriesList(options)`
Mengambil daftar series/novel berdasarkan pagination, kategori, atau pencarian.

### 3. `getSeriesById(id)`
Mengambil detail satu series lengkap dengan daftar chapter, deskripsi, cover image, dan metadata penunjang.

### 4. `getChapterById(chapterId)`
Mengambil konten lengkap satu chapter novel, termasuk penanganan pembersihan HTML dan navigasi chapter sebelumnya & berikutnya.

### 5. `decodeHtmlEntities(html)`
Memperbaiki entitas karakter HTML (seperti `&amp;`, `&#8217;`, `&quot;`) dari WordPress agar tampil sempurna sebagai teks biasa atau HTML ter-sanitize.

---

## ⚡ Caching Client-Side

Untuk menekan jumlah fetch berulang ke WordPress.com API:
- Modul `wp.ts` memanfaatkan helper IndexedDB ringan (`bozunovel-db`) untuk melakukan caching internal response API di browser pengguna.
- Cache dihitung berdasarkan TTL (Time-to-Live) atau dipanggil sesuai kebutuhan per komponen.
