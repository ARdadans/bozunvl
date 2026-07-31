"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBookmarks, Bookmark } from "@/lib/indexeddb";
import { ArrowLeft } from "lucide-react";

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="min-h-screen bg-background text-[var(--color-foreground)]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Bookmarks</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20 text-[var(--color-muted-foreground)] flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mb-4"></div>
            <p>Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-muted-foreground)] bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)]">
            <p className="mb-4">You have no bookmarked series yet.</p>
            <Link href="/" className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center">
              Explore Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {bookmarks.map((bookmark) => (
              <Link 
                key={bookmark.id} 
                href={`/series/${bookmark.id}`}
                className="group flex flex-col gap-3 relative bg-[var(--color-surface)] rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all shadow-sm hover:shadow-md h-full"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-[var(--color-muted)]">
                  <Image 
                    src={bookmark.cover} 
                    alt={bookmark.title} 
                    width={200}
                    height={300}
                    unoptimized
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-3 pb-3 flex-grow">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                    {bookmark.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
