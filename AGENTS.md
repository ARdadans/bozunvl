<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 Project Developer & Agent Guidelines

This project uses Next.js 16 (App Router) configured for full **Static Export (`output: 'export'`)** serving a web novel platform connected to a Headless WordPress REST API.

## Project-Specific Rules

### Icon Usage
- **ALWAYS use `lucide-react` for icons** - This is the ONLY icon library allowed in this project.
- Import icons directly from `lucide-react` (e.g., `import { BookOpen, ArrowRight } from "lucide-react"`).
- Do NOT use other icon libraries (Heroicons, FontAwesome, etc.).
- If a specific icon is not available in `lucide-react`, create a custom SVG component in the `src/components/icons/` directory.

### CSS Variables & Styling
- Use `--color-*` CSS variables defined in `globals.css` for Tailwind inline styles.
- Available color variables: `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-hover`, `--color-primary-muted`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-destructive`, `--color-border`, `--color-input`, `--color-ring`, `--color-card`, `--color-popover`, `--color-sidebar`, etc.
- Use them in Tailwind like: `bg-[var(--color-primary)]`, `text-[var(--color-foreground)]`, `border-[var(--color-border)]`.

### Static Export & Data Fetching Architecture
- **Static Export**: The app builds into a pure static bundle via `output: 'export'` in `next.config.ts`.
- **No Server Functions / Middleware**: Do not introduce Node.js server handlers (`/api/*` routes) or Next.js `middleware.ts` as they do not run in static export mode.
- **Client-Side Data Fetching**: Fetch data on the client side using Client Components (`"use client"`) via helper functions in `src/lib/wp.ts`.
- **Unoptimized Remote Images**: Remote images from WordPress must be handled with `images: { unoptimized: true }` or standard `<img>` / unoptimized `<Image>` tags.

### Chapter Route & URL Formatting Rules
- **Canonical Chapter URL**: Always format chapter URLs as `/ch/{series.id}-{series.title(kebabcase)}-chapter-{chapter.number}-{chapterpost.id}` using `buildChapterUrl()` from `src/lib/wp.ts`.
- **No Build-Time Chapter Page Generation**: `generateStaticParams()` in `src/app/ch/[chapterId]/page.tsx` MUST return a single static placeholder `[{ chapterId: "index" }]` without executing WordPress API fetches during build time.
- **Client-Side Auto-Correction**: Chapter pages in browser extract `postId` from the end of the path, fetch the post & `<pre id="chapter-meta">` JSON via client-side fetch, construct the canonical path, and update browser URL via `window.history.replaceState()`.

### Local Storage & State Management
- **IndexedDB**: User state (bookmarks, reading progress, read chapter history) is stored in browser IndexedDB via `src/lib/indexeddb.ts`.
- **No Server DB / Auth**: Do not attempt to save user state to a remote server database; keep all reader state client-side.

### Documentation Reference
Always consult the detailed documentation in the `docs/` directory before proposing major changes:
- Master Index: [docs/INDEX.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/INDEX.md)
- Architecture: [docs/architecture.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/architecture.md)
- API Integration: [docs/api-integration.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/api-integration.md)
- Client Storage: [docs/client-storage.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/client-storage.md)
- Component Library: [docs/components.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/components.md)
- Vercel Optimization: [docs/vercel-optimization.md](file:///d:/Project_/2026/js/nextjs/bozunovel/docs/vercel-optimization.md)
<!-- END:nextjs-agent-rules -->
