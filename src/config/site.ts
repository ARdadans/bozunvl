// Konfigurasi utama untuk koneksi WordPress API
export const SITE = {
    // Domain dari situs WordPress (contoh get id: https://public-api.wordpress.com/rest/v1.1/sites/dhadhankun.wordpress.com)
    NAME: "dhadhankun.wordpress.com",
    // Site ID unik dari WordPress.com untuk situs ini
    ID: 189902096,
    // Base URL untuk endpoint WordPress REST API v2
    API_REST: "https://public-api.wordpress.com/wp/v2/sites",
    // Jumlah post maksimal per halaman (default fetching limit)
    PER_PAGE: 10,
} as const;

// Konfigurasi khusus untuk Incremental Static Regeneration (ISR)
export const ISR_CONFIG = {
    // Batas jumlah halaman series yang akan di-build secara statis pada saat build-time (npm run build).
    // Sisanya akan di-generate secara on-demand.
    SERIES_BUILD_LIMIT: 20,
} as const;

// Data informasi umum blog untuk keperluan SEO (Metadata) dan UI
export const BLOG = {
    TITLE: "BozuNovel",
    DESCRIPTION: "Baca Shōsetsu (小説), Raito Noberu (ラノベ), Soseol (소설), Wepsoseol (웹소설) Korea & web novel gratis bahasa Indonesia. Platform baca novel Jepang dan Korea dari raw",
    URL: process.env.NEXT_PUBLIC_SITE_URL || "https://bozunovel.com",
    KEYWORDS: [
        "Shōsetsu",
        "小説",
        "Raito Noberu",
        "ラノベ",
        "Soseol",
        "소설",
        "Wepsoseol",
        "웹소설",
        "web novel",
        "novel Jepang",
        "novel Korea",
        "light novel Jepang",
        "baca novel Jepang",
        "baca novel Korea",
        "web novel gratis",
        "novel Jepang raw",
        "novel Korea raw",
        "light novel raw",
        "platform novel Jepang Korea",
        "baca novel dari raw",
        "novel terjemahan Indonesia"
    ],
    // Bahasa utama yang digunakan di blog
    LOCALE: "id-ID",
} as const;
