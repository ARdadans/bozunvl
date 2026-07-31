# CLAUDE.md - BozuNovel Workspace Instructions

@AGENTS.md

## 🚀 Quick Commands

- **Development Server**: `npm run dev`
- **Build Static Export**: `npm run build`
- **Lint Check**: `npm run lint`

## 🛠 Tech Stack Overview

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Export Mode**: Static Export (`output: 'export'`, `images.unoptimized: true`)
- **Styling**: Tailwind CSS v4 + Base UI + Radix UI + shadcn/ui primitives
- **Icon Library**: `lucide-react` (Strict requirement, do not install/use other icon libraries)
- **Headless CMS**: WordPress REST API v2 (`src/lib/wp.ts`, `src/config/site.ts`)
- **Client Storage**: IndexedDB (`src/lib/indexeddb.ts` for bookmarks, history, reader progress)

## 📌 Critical Code Conventions

1. **Icons**: Use ONLY `lucide-react`. Custom SVGs go in `src/components/icons/`.
2. **CSS Variables**: Use `--color-*` variables defined in `globals.css` with Tailwind (e.g. `bg-[var(--color-primary)]`).
3. **Data Fetching**: All dynamic fetching must happen client-side (`"use client"`) to support static export without Vercel server functions.
4. **Client State**: Store reader progress and bookmarks in IndexedDB via `src/lib/indexeddb.ts`.
5. **Chapter URLs**: Format as `/ch/{series.id}-{series.title}-chapter-{chapter.number}-{chapterpost.id}` using `buildChapterUrl()` from `src/lib/wp.ts`. Client auto-corrects URLs via `window.history.replaceState()`.

## 📚 Project Documentation

- [Documentation Index](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/INDEX.md)
- [System Architecture](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/architecture.md)
- [API Integration Guide](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/api-integration.md)
- [Client Storage & IndexedDB](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/client-storage.md)
- [Component Overview](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/components.md)
- [Vercel Usage Optimization](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/vercel-optimization.md)
