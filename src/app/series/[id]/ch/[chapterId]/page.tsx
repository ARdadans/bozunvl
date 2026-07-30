"use client";

import ChapterClient from "./ChapterClient";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ChapterPage() {
  const params = useParams();
  
  if (!params?.id || !params?.chapterId) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <ChapterClient 
      id={params.id as string} 
      chapterId={params.chapterId as string} 
    />
  );
}
