"use client";

import { useEffect, useState } from "react";
import { Chapter } from "@/lib/wp";
import { SITE } from "@/config/site";
import { Reader } from "@/components/chapter/reader";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveSeriesProgress } from "@/lib/indexeddb";

interface ChapterPageData {
  seriesId: string;
  seriesTitle: string;
  chapter: Chapter;
  prevChapterId?: string;
  nextChapterId?: string;
}

export default function ChapterClient({ id, chapterId }: { id: string; chapterId: string }) {
  const [data, setData] = useState<ChapterPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);

        const parts = chapterId.split("-");
        const numericId = parts.length > 1 ? parts[parts.length - 1] : parts[0];

        // Fetch chapter content directly, completely independent of series API
        const url = `${SITE.API_REST}/${SITE.ID}/posts/${numericId}?_fields=id,title,content,modified`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch chapter");
        const jsonRes = await res.json();
        const chapterContent = jsonRes.content?.rendered || "";

        // Extract metadata from <pre id="chapter-meta">
        let meta: any = {};
        const metaMatch = chapterContent.match(/<pre[^>]*id=["']chapter-meta["'][^>]*>([\s\S]*?)<\/pre>/i);
        if (metaMatch && metaMatch[1]) {
          try {
            const textArea = document.createElement('textarea');
            textArea.innerHTML = metaMatch[1];
            meta = JSON.parse(textArea.value);
          } catch(e) {
            console.error("Failed to parse chapter-meta", e);
          }
        }

        const seriesTitle = meta.series || "Unknown Series";
        const chapterNumber = meta.chapter || numericId;

        // Clean title
        const rawTitle = jsonRes.title?.rendered || `Chapter ${chapterNumber}`;
        const textAreaTitle = document.createElement('textarea');
        textAreaTitle.innerHTML = rawTitle;
        const decodedRawTitle = textAreaTitle.value;
        
        // Remove "{Series Title} Ch. {Number}" prefix if it exists
        const prefixRegex = new RegExp(`^${seriesTitle}\\s*Ch\\.?\\s*${chapterNumber}\\s*[-–—:]?\\s*`, 'i');
        let cleanTitle = decodedRawTitle.replace(prefixRegex, '').trim();
        if (!cleanTitle) {
          cleanTitle = decodedRawTitle;
        }

        const nextChapterIdStr = meta.next ? `${meta.next.chapter}-${meta.next.postId}` : undefined;
        const prevChapterIdStr = meta.previous ? `${meta.previous.chapter}-${meta.previous.postId}` : undefined;

        if (isMounted) {
          setData({
            seriesId: id, // using the slug from the URL
            seriesTitle: seriesTitle,
            chapter: {
              id: numericId,
              number: Number(chapterNumber),
              title: cleanTitle,
              publishedAt: jsonRes.modified || new Date().toISOString(),
              wordCount: 0,
              content: chapterContent
            },
            prevChapterId: prevChapterIdStr,
            nextChapterId: nextChapterIdStr
          });
          setLoading(false);
          
          saveSeriesProgress({
            seriesId: id,
            chapterId: numericId,
            number: Number(chapterNumber)
          });
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

  if (error || !data) {
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

  return (
    <Reader
      seriesId={data.seriesId}
      seriesTitle={data.seriesTitle}
      chapter={data.chapter}
      totalChapters={0} // Independent fetch doesn't know total chapters
      prevChapterId={data.prevChapterId}
      nextChapterId={data.nextChapterId}
    />
  );
}
