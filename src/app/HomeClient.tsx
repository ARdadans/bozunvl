"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Novel } from "@/lib/wp";
import { getCategoryId, getSeriesByCategory } from "@/lib/wp";
import { SeriesCard } from "@/components/series/series-card";
import { Button } from "@/components/ui/button";
import { SITE } from "@/config/site";

export default function Home() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [popularNovels, setPopularNovels] = useState<Novel[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const categoryId = await getCategoryId("type-series");
      if (categoryId) {
        const fetchedNovels = await getSeriesByCategory(categoryId, 1, SITE.PER_PAGE);
        setNovels(fetchedNovels);
        
        // For popular novels, we can use the same list or sort differently
        setPopularNovels(fetchedNovels.slice(0, 5));
        
        setHasMore(fetchedNovels.length === SITE.PER_PAGE);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const loadMore = async () => {
    const categoryId = await getCategoryId("type-series");
    if (categoryId) {
      const nextPage = page + 1;
      const moreNovels = await getSeriesByCategory(categoryId, nextPage, SITE.PER_PAGE);
      if (moreNovels.length > 0) {
        setNovels((prev) => [...prev, ...moreNovels]);
        setPage(nextPage);
      }
      if (moreNovels.length < SITE.PER_PAGE) {
        setHasMore(false);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

            {/* All Series Column (left, 3/4 width on desktop) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="border-b border-border/60 pb-4">
                <h1 className="font-heading text-xl font-bold md:text-2xl">All Series</h1>
              </div>

              {isLoading && novels.length === 0 ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 md:gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="w-full aspect-[2/3] bg-muted animate-pulse rounded-sm" />
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 md:gap-4">
                  {novels.map((series) => (
                    <div key={series.id}>
                      <SeriesCard series={series} />
                    </div>
                  ))}
                </div>
              )}

              {hasMore && novels.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>

            {/* Popular Series Column (right, 1/4 width on desktop, pushed below on mobile) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-heading text-xl font-bold">Popular Series</h2>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Trending among readers this week</p>
              </div>
              <div className="space-y-4">
                {isLoading && popularNovels.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                      <div className="w-6 h-6 bg-muted animate-pulse rounded opacity-50" />
                      <div className="h-16 w-12 bg-muted animate-pulse rounded-md shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))
                ) : popularNovels.map((novel, index) => (
                  <Link
                    key={novel.id}
                    href={`/series/${novel.id}`}
                    className="group flex items-center gap-4 rounded-lg p-2 transition-all hover:bg-muted/40"
                  >
                    <span className="font-heading text-xl font-extrabold text-primary w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border/40">
                      <img
                        src={novel.cover}
                        alt={novel.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {novel.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ch. {novel.lastCh}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-primary">
                          <Star className="h-3 w-3 fill-primary" />
                          {novel.rating}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">•</span>
                        <span className="text-[10px] text-muted-foreground/80 font-medium">
                          {novel.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
