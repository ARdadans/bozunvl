# Komponen UI & Design System

Dokumen ini menjelaskan struktur komponen, hirarki layout, dan pustaka antarmuka yang digunakan dalam proyek **BozuNovel**.

---

## 🎨 Design System & Framework

- **Tailwind CSS v4**: Digunakan untuk styling utilitas cepat dengan variabel CSS dinamis (`--color-*` yang didefinisikan di `src/app/globals.css`).
- **Base UI & Radix UI**: Digunakan untuk komponen primitif headless yang accessible (Dialog, Dropdown Menu, Popover, Select, Tabs, Navigation Menu, Slider).
- **lucide-react**: Library ikon tunggal yang wajib digunakan di seluruh aplikasi (sesuai aturan di `AGENTS.md`).
- **shadcn/ui Design Pattern**: Komponen modular reusable yang ditempatkan di `src/components/ui/`.

---

## 🧩 Hirarki & Kategori Komponen (`src/components/`)

### 1. Header & Navigasi Situs (`src/components/site/`)
- `header.tsx`: Header utama situs dengan bilah pencarian cepat, navigasi menu, tombol bookmark, dan pengubah tema (light/dark).
- `footer.tsx`: Footer bawaan dengan informasi hak cipta, tautan navigasi, dan kredensial platform.

### 2. Komponen Novel & Series (`src/components/series/`)
- `series-card.tsx`: Kartu tampilan novel ringkas (grid view) dengan cover, judul, status, dan rating.
- `series-card-row.tsx`: Tampilan baris horizontal novel untuk list/carousel.
- `series-header.tsx`: Header detail series dengan sinopsis, metadata, tombol bookmark, dan tombol mulai/lanjutkan membaca.
- `chapter-list.tsx`: Komponen daftar chapter dengan indikator status terbaca, pencarian chapter, dan sorting.

### 3. Komponen Reader Chapter (`src/components/chapter/`)
- `reader.tsx`: Komponen pembaca novel utama dengan toolbar pengaturan font (ukuran, tipe font, line-height), opsi warna latar (light, sepia, dark), serta tombol navigasi chapter sebelumnya/berikutnya.
- `reader.module.css`: CSS Module khusus untuk styling area teks novel.

### 4. Komponen UI Reusable (`src/components/ui/`)
Komponen primitif yang dibangun dengan Radix UI & Base UI:
- `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `popover.tsx`, `select.tsx`, `skeleton.tsx`, `tabs.tsx`, `carousel.tsx`, `drawer.tsx`, `sonner.tsx`.

---

## 💡 Aturan Penggunaan Komponen & Icon

1. **Wajib Menggunakan `lucide-react`**:
   - Dilarang mengimpor library icon lain (seperti FontAwesome, Heroicons, React Icons).
   - Contoh import: `import { BookOpen, ArrowRight } from "lucide-react"`.
   - Jika ikon tidak ada di `lucide-react`, buat SVG kustom di `src/components/icons/`.

2. **Penggunaan Variabel CSS Warna**:
   - Gunakan sintaks variabel CSS `--color-*` di Tailwind CSS.
   - Contoh: `bg-[var(--color-primary)]`, `text-[var(--color-foreground)]`, `border-[var(--color-border)]`.
