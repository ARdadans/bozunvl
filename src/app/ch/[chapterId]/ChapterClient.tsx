"use client";

import { useEffect, useState } from "react";
import { Chapter, buildChapterUrl } from "@/lib/wp";
import { SITE } from "@/config/site";
import { Reader } from "@/components/chapter/reader";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveSeriesProgress } from "@/lib/indexeddb";

interface ChapterPageData {
  seriesId: string;
  seriesTitle: string;
  seriesUrl: string;
  chapter: Chapter;
  prevChapterUrl?: string;
  nextChapterUrl?: string;
  prevChapterNum?: number;
  nextChapterNum?: number;
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

        let effectivePath = chapterId;
        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          const segments = pathname.split("/").filter(Boolean);
          const chIndex = segments.indexOf("ch");
          if (chIndex !== -1 && segments.length > chIndex + 1) {
            const rawSegment = segments[chIndex + 1];
            if (rawSegment && rawSegment !== "index") {
              effectivePath = rawSegment;
            }
          }
        }

        const parts = effectivePath.split("-");
        const numericId = parts.length > 0 ? parts[parts.length - 1] : effectivePath;

        if (!numericId || numericId === "index" || isNaN(Number(numericId))) {
          throw new Error("Invalid chapter ID");
        }

        // Fetch chapter content directly, completely independent of series API
        const url = `${SITE.API_REST}/${SITE.ID}/posts/${numericId}?_fields=id,title,content,modified`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch chapter");
        const jsonRes = await res.json();
        const chapterContent = jsonRes.content?.rendered || "";

        // Extract metadata from <pre id="chapter-meta">
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const chapterNumber = meta.chapter !== undefined ? meta.chapter : numericId;

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

        // Determine canonical series info for URL path
        const seriesInfo = {
          id: meta.seriesId || id || "series",
          title: seriesTitle,
          seriesUrl: meta.seriesUrl
        };

        const canonicalPath = buildChapterUrl(seriesInfo, { id: numericId, number: chapterNumber });

        // Auto-correct browser URL path client-side without page reload
        if (typeof window !== "undefined") {
          if (window.location.pathname !== canonicalPath) {
            window.history.replaceState(null, "", canonicalPath);
          }
        }

        const prevChapterUrl = meta.previous
          ? buildChapterUrl(seriesInfo, { id: meta.previous.postId, number: meta.previous.chapter })
          : undefined;

        const nextChapterUrl = meta.next
          ? buildChapterUrl(seriesInfo, { id: meta.next.postId, number: meta.next.chapter })
          : undefined;

        let seriesUrl = meta.seriesUrl;
        if (!seriesUrl) {
          const seriesSlug = meta.seriesId
            ? `${meta.seriesId}-${seriesTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
            : id;
          seriesUrl = `/series/${seriesSlug}`;
        }

        if (isMounted) {
          setData({
            seriesId: meta.seriesId ? String(meta.seriesId) : id,
            seriesTitle: seriesTitle,
            seriesUrl: seriesUrl,
            chapter: {
              id: numericId,
              number: Number(chapterNumber),
              title: cleanTitle,
              publishedAt: jsonRes.modified || new Date().toISOString(),
              wordCount: 0,
              content: chapterContent
            },
            prevChapterUrl,
            nextChapterUrl,
            prevChapterNum: meta.previous ? Number(meta.previous.chapter) : undefined,
            nextChapterNum: meta.next ? Number(meta.next.chapter) : undefined,
          });
          setLoading(false);
          
          saveSeriesProgress({
            seriesId: meta.seriesId ? String(meta.seriesId) : id,
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
      seriesUrl={data.seriesUrl}
      chapter={data.chapter}
      prevChapterUrl={data.prevChapterUrl}
      nextChapterUrl={data.nextChapterUrl}
      prevChapterNum={data.prevChapterNum}
      nextChapterNum={data.nextChapterNum}
    />
  );
}

