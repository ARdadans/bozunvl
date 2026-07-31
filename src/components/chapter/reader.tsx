"use client";

import { useState } from "react";
import styles from "./reader.module.css";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Settings, Home, List, Info } from "lucide-react";
import { Chapter } from "@/lib/wp";
import { toast } from "sonner";

interface ReaderProps {
  seriesId: string;
  seriesTitle: string;
  seriesUrl?: string;
  chapter: Chapter;
  prevChapterUrl?: string;
  nextChapterUrl?: string;
  prevChapterNum?: number;
  nextChapterNum?: number;
}

export function Reader({
  seriesId,
  seriesTitle,
  seriesUrl,
  chapter,
  prevChapterUrl,
  nextChapterUrl,
  prevChapterNum,
  nextChapterNum,
}: ReaderProps) {
  const [showToolbars, setShowToolbars] = useState(true);

  const targetSeriesUrl = seriesUrl || `/series/${seriesId}`;

  const handleContainerClick = (e: React.MouseEvent) => {
    // Abaikan klik jika user sedang melakukan highlight/seleksi teks
    if (window.getSelection()?.toString().length) {
      return;
    }
    
    // Abaikan klik jika user mengklik elemen interaktif (link atau tombol) di dalam chapter
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) {
      return;
    }

    setShowToolbars(!showToolbars);
  };

  return (
    <div className={`min-h-screen relative ${styles.readerContainer}`} onClick={handleContainerClick}>
      {/* Top Floating Toolbar */}
      <div 
        className={`fixed top-4 right-4 z-[1000] flex items-center rounded-md border border-border bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-opacity duration-300 ease-in-out ${showToolbars ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
        id="chapter-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        {prevChapterUrl ? (
          <Link href={prevChapterUrl} aria-label="Previous Chapter" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" id="chapter-prev-btn" title="Previous Chapter">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div aria-label="Previous Chapter" className="flex h-11 w-11 items-center justify-center text-muted-foreground opacity-40 pointer-events-none" id="chapter-prev-btn" title="Previous Chapter">
            <ChevronLeft className="h-4 w-4" />
          </div>
        )}
        <button aria-label="Chapter List" className="max-w-32 truncate bg-transparent border-none px-3 text-xs font-semibold text-muted-foreground cursor-pointer font-sans transition-colors hover:text-primary" id="chapter-toolbar-ch" title="Chapter List" type="button">
          Ch. {chapter.number}
        </button>
        {nextChapterUrl ? (
          <Link href={nextChapterUrl} aria-label="Next Chapter" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" id="chapter-next-btn" title="Next Chapter">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div aria-label="Next Chapter" className="flex h-11 w-11 items-center justify-center text-muted-foreground opacity-40 pointer-events-none" id="chapter-next-btn" title="Next Chapter">
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Side Toolbar */}
      <div 
        className={`fixed top-20 right-4 z-[1000] flex flex-col overflow-hidden rounded-md border border-border bg-card/90 backdrop-blur-sm shadow-lg divide-y divide-border transition-opacity duration-300 ease-in-out ${showToolbars ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
        id="chapter-side-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <Link aria-label="Home" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" href="/" id="chapter-home-btn" title="Home">
          <Home className="h-4 w-4" />
        </Link>
        <Link aria-label="Series" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" href={targetSeriesUrl} id="chapter-series-btn" title="Series">
          <BookOpen className="h-4 w-4" />
        </Link>
        <Link aria-label="Chapter List" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" href={`${targetSeriesUrl}#chapter-list`} id="chapter-side-toc-btn" title="Chapter List">
          <List className="h-4 w-4" />
        </Link>
        <button onClick={() => toast("Coming soon")} aria-label="Info" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" id="chapter-info-btn" title="Info">
          <Info className="h-4 w-4" />
        </button>
        <button onClick={() => toast("Coming soon")} aria-label="Reader Settings" className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground" id="chapter-side-settings-btn" title="Reader Settings">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <article className="prose-reading mx-auto">
            <h1 className="chapter-title">{chapter.title}</h1>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: chapter.content }} />
          </article>

          <div className="space-y-3 pt-8" id="chapter-nav">
            <div className="group flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 transition-colors hover:bg-accent border border-border/40">
              <Link className="flex min-w-0 flex-1 items-center gap-3" href={targetSeriesUrl} id="chapter-series-home" title={seriesTitle}>
                <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="block w-full truncate overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-foreground transition-colors group-hover:text-primary" id="nav-series-title">
                    {seriesTitle}
                  </span>
                  <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary" id="nav-series-ch">
                    Ch. {chapter.number}
                  </span>
                </div>
              </Link>
              <Link className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground transition-colors hover:text-primary hover:bg-muted" href="/" title="Home">
                <Home className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-2">
              {prevChapterUrl ? (
                <Link className="group flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-card px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary border border-border/40" href={prevChapterUrl} id="nav-prev">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                  {prevChapterNum !== undefined && (
                    <>
                      <span className="text-muted-foreground transition-colors group-hover:text-primary">•</span>
                      <span className="text-muted-foreground transition-colors group-hover:text-primary" id="nav-prev-ch">
                        Ch. {prevChapterNum}
                      </span>
                    </>
                  )}
                </Link>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-card/30 px-3 py-3 text-sm font-medium text-muted-foreground border border-border/20 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4 opacity-50" />
                  <span>Prev</span>
                </div>
              )}
              {nextChapterUrl ? (
                <Link className="group flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-card px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary border border-border/40" href={nextChapterUrl} id="nav-next">
                  <span>Next</span>
                  {nextChapterNum !== undefined && (
                    <>
                      <span className="text-muted-foreground transition-colors group-hover:text-primary">•</span>
                      <span className="text-muted-foreground transition-colors group-hover:text-primary" id="nav-next-ch">
                        Ch. {nextChapterNum}
                      </span>
                    </>
                  )}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-card/30 px-3 py-3 text-sm font-medium text-muted-foreground border border-border/20 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

