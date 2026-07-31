import { Suspense } from "react";
import ChapterClient from "./ChapterClient";
import { Loader2 } from "lucide-react";

export default function ChapterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <ChapterClient />
    </Suspense>
  );
}
