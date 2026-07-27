<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project-Specific Rules

### Icon Usage
- **ALWAYS use `lucide-react` for icons** - This is the only icon library allowed in this project
- Import icons directly from `lucide-react` (e.g., `import { BookOpen, ArrowRight } from "lucide-react"`)
- Do NOT use other icon libraries (Heroicons, FontAwesome, etc.)
- If a specific icon is not available in lucide-react, create a custom SVG component in `src/components/icons/` directory

### CSS Variables
- Use `--color-*` CSS variables defined in `globals.css` for Tailwind inline styles
- Available color variables: `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-hover`, `--color-primary-muted`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-destructive`, `--color-border`, `--color-input`, `--color-ring`, `--color-card`, `--color-popover`, `--color-sidebar`, etc.
- Use them in Tailwind like: `bg-[var(--color-primary)]`, `text-[var(--color-foreground)]`, `border-[var(--color-border)]`
<!-- END:nextjs-agent-rules -->
