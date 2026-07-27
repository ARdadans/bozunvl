"use client";

import { useEffect, useState } from "react";
import { getSeriesById, Chapter, Novel } from "@/lib/wp";
import { SITE } from "@/config/site";
import { Reader } from "@/components/chapter/reader";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ChapterClient({ id, chapterId }: { id: string; chapterId: string }) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch series metadata
        const fetchedNovel = await getSeriesById(id);
        if (!fetchedNovel) {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        const parts = chapterId.split("-");
        const numericId = parts.length > 1 ? parts[1] : parts[0];

        // Fetch chapter content
        const url = `${SITE.API_REST}/${SITE.ID}/posts/${numericId}?_fields=id,title,content,modified`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch chapter");
        const data = await res.json();
        const chapterContent = data.content?.rendered || "";

        const currentChapterMeta = fetchedNovel.chapters.find(c => c.id.toString() === numericId);

        if (!currentChapterMeta) {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setNovel(fetchedNovel);
          setChapter({
            ...currentChapterMeta,
            content: chapterContent
          });
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !novel || !chapter) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-[var(--color-foreground)]">
        <h1 className="font-heading text-2xl font-bold">Chapter not found</h1>
        <p className="mt-4 text-[var(--color-muted-foreground)]">The chapter you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-primary-hover)] font-bold py-2.5 px-5 rounded-[var(--radius)]"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const parts = chapterId.split("-");
  const numericId = parts.length > 1 ? parts[1] : parts[0];
  const currentIndex = novel.chapters.findIndex((c) => c.id.toString() === numericId);
  const prevChapter = currentIndex > 0 ? novel.chapters[currentIndex - 1] : undefined;
  const nextChapter = currentIndex < novel.chapters.length - 1 ? novel.chapters[currentIndex + 1] : undefined;

  const prevChapterIdStr = prevChapter ? `${prevChapter.number}-${prevChapter.id}` : undefined;
  const nextChapterIdStr = nextChapter ? `${nextChapter.number}-${nextChapter.id}` : undefined;

  return (
    <Reader
      seriesId={novel.id}
      seriesTitle={novel.title}
      chapter={chapter}
      totalChapters={novel.chapters.length}
      prevChapterId={prevChapterIdStr}
      nextChapterId={nextChapterIdStr}
    />
  );
}
