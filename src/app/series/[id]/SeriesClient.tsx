"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Bookmark,
  Search,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";
import {
  TwitterIcon,
  WhatsAppIcon,
  TelegramIcon,
  FacebookIcon,
  CopyIcon,
  ShareIcon
} from "@/components/icons";
import { toast } from "sonner";
import { Novel } from "@/lib/wp";

export default function SeriesClient({ series }: { series: Novel }) {
  const [isAltsExpanded, setIsAltsExpanded] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isMobileDetailsExpanded, setIsMobileDetailsExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [chapterSearch, setChapterSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [chapterSearch, sortOrder]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setShareUrl(window.location.href);
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        if (series) {
          setIsBookmarked(bookmarks.includes(series.id));
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [series]);

  const handleBookmarkToggle = () => {
    if (!series) return;
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    let newBookmarks;
    if (bookmarks.includes(series.id)) {
      newBookmarks = bookmarks.filter((id: string) => id !== series.id);
      setIsBookmarked(false);
    } else {
      newBookmarks = [...bookmarks, series.id];
      setIsBookmarked(true);
    }
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = () => {
    if (!series) return;
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: series.title,
        text: series.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  const sortedAndFilteredChapters = useMemo(() => {
    if (!series) return [];
    let list = [...series.chapters];
    if (chapterSearch.trim()) {
      const q = chapterSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.number.toString().includes(q) ||
          (c.title && c.title.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      return sortOrder === "desc" ? b.number - a.number : a.number - b.number;
    });
    return list;
  }, [series, chapterSearch, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredChapters.length / rowsPerPage);

  const paginatedChapters = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedAndFilteredChapters.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedAndFilteredChapters, currentPage, rowsPerPage]);

  const titleAlts = series.titleAlts || [];
  const artist = series.artist;
  const publisher = series.publisher;
  const country = series.country;
  const language = series.language;
  const year = series.year;
  const tags = series.tags || [];
  const media = series.media;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(series.title);

  return (
    <div className="min-h-screen bg-background text-[var(--color-foreground)]">
      <div className="container mx-auto px-4 py-8">
        <article className="lg:px-24 lg:pb-16 md:pt-4 bg-[var(--color-background)]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="w-full md:w-[240px] flex-shrink-0 flex justify-center md:block">
              <div className="w-[200px] md:w-[240px] aspect-[2/3] bg-[var(--color-surface)] rounded-[var(--radius)] overflow-hidden relative border border-[var(--color-border)] shadow-md">
                <img
                  alt={series.title}
                  className="w-full h-full object-cover"
                  height="900"
                  loading="lazy"
                  src={series.cover}
                  title={`Cover ${series.title}`}
                  width="600"
                />
              </div>
            </div>

            <div className="flex-grow min-w-0 w-full flex flex-col gap-4">
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <h1 className="font-heading text-xl md:text-2xl font-extrabold leading-tight text-[var(--color-foreground)]">
                  {series.title}
                </h1>
                {titleAlts.length > 0 && (
                  <div className="mt-1.5 flex flex-col font-sans w-full">
                    <button
                      onClick={() => setIsAltsExpanded(!isAltsExpanded)}
                      className="flex items-center justify-between gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors cursor-pointer text-left bg-transparent border-0 p-0 outline-none w-full md:max-w-[360px] min-w-0"
                    >
                      <span className="truncate block italic font-medium">
                        {titleAlts.join(" / ")}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200",
                          isAltsExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-350 ease-in-out overflow-hidden",
                        isAltsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="min-h-0 flex flex-col gap-1.5 pt-2 text-xs text-[var(--color-muted-foreground)] font-medium italic text-left">
                        {titleAlts.map((alt, idx) => (
                          <div key={idx}>{alt}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 -mt-2">
                <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)] font-sans">
                  <span className="font-semibold">Author:</span>
                  <span className="font-medium flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/search?q=label%3A%22author%3A${encodeURIComponent(series.author.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      {series.author}
                    </Link>
                  </span>
                </div>
                {artist && (
                  <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)] font-sans">
                    <span className="font-semibold">Art:</span>
                    <span className="font-medium flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/search?q=label%3A%22artist%3A${encodeURIComponent(artist.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                        className="hover:text-[var(--color-primary)] transition-colors"
                      >
                        {artist}
                      </Link>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-xs">
                {media && (
                  <Link
                    href={`/search?q=label%3A%22media%3A${encodeURIComponent(media.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]"
                  >
                    {media}
                  </Link>
                )}
                <Link
                  href={`/search?q=label%3A%22status%3A${encodeURIComponent(series.status.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                  className={cn(
                    "px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] border transition-colors",
                    series.status === "Ongoing"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted-foreground)]"
                  )}
                >
                  {series.status}
                </Link>
                {year && (
                  <Link
                    href={`/search?q=label%3A%22year%3A${encodeURIComponent(year.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]"
                  >
                    {year}
                  </Link>
                )}
              </div>

              <div className="hidden md:flex flex-col gap-2.5">
                {/* Genres */}
                <div className="flex items-center gap-1.5 flex-wrap min-w-0 w-full">
                  <span className="font-heading text-xs text-muted-foreground">Genres:</span>
                  <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                    {series.genres.map((genre, idx) => {
                      const isHidden = !showAllGenres && idx >= 5;
                      return (
                        <li key={genre} className={isHidden ? "hidden" : "block"}>
                          <Link
                            href={`/search?q=label%3A%22genre%3A${encodeURIComponent(genre.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-transparent hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer block"
                          >
                            {genre}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {series.genres.length > 5 && (
                    <button
                      onClick={() => setShowAllGenres(!showAllGenres)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)]/40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                    >
                      {showAllGenres ? "Less" : "More"}{" "}
                      <ChevronRight
                        className={cn("w-3.5 h-3.5 transition-transform duration-200", showAllGenres && "rotate-90")}
                      />
                    </button>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0 w-full">
                    <span className="font-heading text-xs text-muted-foreground">Tags:</span>
                    <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                      {tags.map((tag, idx) => {
                        const isHidden = !showAllTags && idx >= 5;
                        return (
                          <li key={tag} className={isHidden ? "hidden" : "block"}>
                            <Link
                              href={`/search?q=label%3A%22tag%3A${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-transparent hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer block"
                            >
                              {tag}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {tags.length > 5 && (
                      <button
                        onClick={() => setShowAllTags(!showAllTags)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)]/40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        {showAllTags ? "Less" : "More"}{" "}
                        <ChevronRight
                          className={cn("w-3.5 h-3.5 transition-transform duration-200", showAllTags && "rotate-90")}
                        />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm leading-relaxed text-[var(--color-muted-foreground)] mt-1 relative flex flex-col">
                <div
                  className={cn(
                    "text-sm leading-relaxed text-[var(--color-muted-foreground)] transition-[max-height] duration-350 ease-in-out overflow-hidden relative",
                    isDescriptionExpanded ? "max-h-[1000px]" : "max-h-[4.5rem] md:max-h-none"
                  )}
                >
                  {series.description}

                  {/* Gradient overlay for collapsed state */}
                  {!isDescriptionExpanded && series.description && series.description.length > 150 && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--color-background)] to-transparent pointer-events-none md:hidden" />
                  )}
                </div>
                {series.description && series.description.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer flex items-center gap-1 mt-1 md:hidden self-start"
                    type="button"
                  >
                    <span>{isDescriptionExpanded ? "Show Less" : "Show More"}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isDescriptionExpanded && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>

              {(publisher || country || language) && (
                <div className="hidden md:block text-xs font-sans mt-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-muted-foreground)]">
                    {publisher && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold">Publisher:</span>
                        <span className="font-medium flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/search?q=label%3A%22publisher%3A${encodeURIComponent(publisher.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                            className="hover:text-[var(--color-primary)] transition-colors"
                          >
                            {publisher}
                          </Link>
                        </span>
                      </span>
                    )}
                    {country && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold">Country:</span>
                        <span className="font-medium flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/search?q=label%3A%22country%3A${encodeURIComponent(country.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                            className="hover:text-[var(--color-primary)] transition-colors"
                          >
                            {country}
                          </Link>
                        </span>
                      </span>
                    )}
                    {language && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold">Language:</span>
                        <span className="font-medium flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/search?q=label%3A%22language%3A${encodeURIComponent(language.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                            className="hover:text-[var(--color-primary)] transition-colors"
                          >
                            {language}
                          </Link>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Details Card */}
              {((publisher || country || language) || (series.genres && series.genres.length > 0) || (tags && tags.length > 0)) && (
                <div className="series-details-mobile md:hidden mt-2">
                  <button
                    onClick={() => setIsMobileDetailsExpanded(!isMobileDetailsExpanded)}
                    className="flex items-center justify-between gap-1.5 w-full text-xs font-bold text-[var(--color-foreground)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] px-4 py-3 cursor-pointer transition-all duration-200"
                    type="button"
                  >
                    <span>{isMobileDetailsExpanded ? "Hide Details" : "Show Details"}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isMobileDetailsExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-350 ease-in-out overflow-hidden",
                      isMobileDetailsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="min-h-0 flex flex-col gap-3 pt-3 text-xs font-sans">
                      {(publisher || country || language) && (
                        <div className="series-details-metadata flex flex-col gap-1.5">
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-muted-foreground)]">
                            {publisher && (
                              <span className="flex items-center gap-1.5">
                                <span className="font-semibold">Publisher:</span>
                                <span className="font-medium flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/search?q=label%3A%22publisher%3A${encodeURIComponent(publisher.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                                    className="hover:text-[var(--color-primary)] transition-colors"
                                  >
                                    {publisher}
                                  </Link>
                                </span>
                              </span>
                            )}
                            {country && (
                              <span className="flex items-center gap-1.5">
                                <span className="font-semibold">Country:</span>
                                <span className="font-medium flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/search?q=label%3A%22country%3A${encodeURIComponent(country.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                                    className="hover:text-[var(--color-primary)] transition-colors"
                                  >
                                    {country}
                                  </Link>
                                </span>
                              </span>
                            )}
                            {language && (
                              <span className="flex items-center gap-1.5">
                                <span className="font-semibold">Language:</span>
                                <span className="font-medium flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/search?q=label%3A%22language%3A${encodeURIComponent(language.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                                    className="hover:text-[var(--color-primary)] transition-colors"
                                  >
                                    {language}
                                  </Link>
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {series.genres && series.genres.length > 0 && (
                        <div className="series-details-genres">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold">Genres:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {series.genres.map((genre) => (
                                <Link
                                  key={genre}
                                  href={`/search?q=label%3A%22genre%3A${encodeURIComponent(genre.toLowerCase())}%22%2Blabel%3A%22type%3Aseries%22`}
                                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:border-transparent hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                >
                                  {genre}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {tags && tags.length > 0 && (
                        <div className="series-details-tags">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold">Tags:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map((tag) => (
                                <Link
                                  key={tag}
                                  href={`/search?q=label%3A%22tag%3A${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}%22%2Blabel%3A%22type%3Aseries%22`}
                                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:border-transparent hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                >
                                  {tag}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {series.chapters && series.chapters.length > 0 && (
                  <Link
                    className="bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-primary-hover)] font-bold py-2.5 px-5 rounded-[var(--radius)] text-xs md:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow"
                    href={`/series/${series.id}/ch/${series.chapters[0]?.number}-${series.chapters[0]?.id}`}
                    id="start-reading-btn"
                  >
                    <Play className="w-4 h-4 fill-current" /> Start Reading
                  </Link>
                )}
                <button
                  onClick={handleBookmarkToggle}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-foreground)] py-2.5 px-4 text-xs md:text-sm font-semibold cursor-pointer flex items-center gap-2 hover:border-transparent hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] transition-all bookmark-toggle-btn"
                  data-id={series.id}
                  data-image={series.cover}
                  data-title={series.title}
                  data-url={shareUrl}
                  id="bookmark-btn"
                >
                  <Bookmark className={cn("w-4 h-4 transition-colors", isBookmarked && "fill-current text-[var(--color-primary)]")} />
                  <span className="btn-text">{isBookmarked ? "Bookmarked" : "Add to Bookmarks"}</span>
                </button>
              </div>

              {/* Share icons */}
              <div className="flex items-center gap-2.5 text-xs text-[var(--color-muted-foreground)] mt-2">
                <span>SHARE</span>
                <div className="flex items-center gap-1.5">
                  <a
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all"
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Share on X"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Share on Facebook"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all"
                    href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Share on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all"
                    href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Share on Telegram"
                  >
                    <TelegramIcon className="w-3.5 h-3.5" />
                  </a>
                  <button
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
                    onClick={() => {
                      handleCopyLink();
                      toast("Copied to clipboard", {
                        position: "bottom-center",
                      });
                    }}
                    title="Copy Link"
                  >
                    <CopyIcon className={cn("w-3.5 h-3.5 transition-colors", copied && "text-[var(--color-primary)]")} />
                  </button>
                  <button
                    className="share-btn w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
                    onClick={handleNativeShare}
                    title="Share"
                  >
                    <ShareIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden metadata for SEO & integrations */}
          <div className="meta hidden" aria-hidden="true">
            <span className="summary">{series.description}</span>
            {titleAlts.length > 0 && (
              <ul className="title-alts">
                {titleAlts.map((alt) => (
                  <li key={alt}>{alt}</li>
                ))}
              </ul>
            )}
            {series.genres && series.genres.length > 0 && (
              <ul className="genres">
                {series.genres.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            )}
            {tags.length > 0 && (
              <ul className="tag">
                {tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            {media && <span className="media">{media}</span>}
            <span className="author">{series.author}</span>
            {artist && <span className="artist">{artist}</span>}
            {publisher && <span className="publisher">{publisher}</span>}
            {country && <span className="country">{country}</span>}
            {language && <span className="language">{language}</span>}
            <span className="status">{series.status}</span>
            {year && <span className="year">{year}</span>}
          </div>

          <div className="hidden" id="series-page-metadata" aria-hidden="true">
            <span className="label-item">author:{series.author.toLowerCase().replace(/\s+/g, "-")}</span>
            {series.genres && series.genres[0] && (
              <span className="label-item">genre:{series.genres[0].toLowerCase()}</span>
            )}
            {media && (
              <span className="label-item">media:{media.toLowerCase()}</span>
            )}
            <span className="label-item">series:{series.title.toLowerCase().replace(/\s+/g, "-")}</span>
            <span className="label-item">status:{series.status.toLowerCase()}</span>
            <span className="label-item">type:series</span>
          </div>

          {/* Chapters Section */}
          <div className="mt-8" id="chapters-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base text-[var(--color-foreground)] font-bold">Chapters</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-[var(--color-surface)]/50 text-xs rounded-t-[var(--radius)] border border-[var(--color-border)]">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                <input
                  type="text"
                  id="chapter-search-input"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Search chapter number..."
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius)] pl-9 pr-4 py-2 text-[var(--color-foreground)] outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  id="chapter-sort-btn"
                  className="bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-foreground)] px-3 py-2 rounded-[var(--radius)] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Sort:
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-b-[var(--radius)] overflow-hidden border-x border-b border-[var(--color-border)]" id="chapters-list-container">
              {paginatedChapters.length > 0 ? (
                paginatedChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/series/${series.id}/ch/${chapter.number}-${chapter.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface-foreground transition-colors group border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <div className="flex items-baseline gap-2 min-w-0 flex-grow">
                      <span className="text-xs md:text-sm font-semibold text-[var(--color-foreground)] transition-colors whitespace-nowrap flex-shrink-0">
                        Ch. {chapter.number}
                      </span>
                      {chapter.title && (
                        <span className="text-[11px] md:text-xs text-[var(--color-muted-foreground)] font-medium truncate">
                          {chapter.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)] flex-shrink-0">
                      <RelativeTime date={chapter.publishedAt} />
                      <Bookmark className="w-3.5 h-3.5 fill-none stroke-current opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  No chapters found.
                </div>
              )}
            </div>
            
            {sortedAndFilteredChapters.length > 25 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 py-2">
                <div className="flex items-center space-x-2 text-sm text-[var(--color-muted-foreground)]">
                  <p>Rows per page</p>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center mx-1 gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                        .map((p, i, arr) => {
                          const isEllipsis = i > 0 && arr[i] - arr[i - 1] > 1;
                          return (
                            <React.Fragment key={p}>
                              {isEllipsis && <span className="text-[var(--color-muted-foreground)] px-1">...</span>}
                              <Button
                                variant={currentPage === p ? "default" : "outline"}
                                className={cn(
                                  "h-8 w-8 p-0 text-sm",
                                  currentPage === p 
                                    ? "bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-primary-hover)]" 
                                    : "bg-transparent text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-surface)]",
                                  currentPage !== p && "hidden sm:inline-flex"
                                )}
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </Button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-8 mb-8 md:mb-0">
            <section className="cm comments-shell">
              <div className="cmShw">
                <a
                  className="cmBtn bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-card)] text-[var(--color-foreground)] rounded-[var(--radius)] py-3 px-4 font-bold text-center block text-sm transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Comments section integration placeholder.");
                  }}
                  role="button"
                >
                  <span>Disquss</span>
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
