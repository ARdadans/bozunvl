"use client";

import { useState, useEffect } from "react";
import { Series, getCategoryId, getSeriesByCategory, getPopularSeries, idbGet, idbSet } from "@/lib/wp";
import { SeriesCard } from "@/components/series/series-card";
import { Button } from "@/components/ui/button";
import { SITE } from "@/config/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home({ initialSeries = [], initialPopularSeries = [] }: { initialSeries?: Series[], initialPopularSeries?: Series[] }) {
  const [seriesList, setSeriesList] = useState<Series[]>(initialSeries);
  const [popularSeries, setPopularSeries] = useState<Series[]>(initialPopularSeries);
  const [isPopularLoading, setIsPopularLoading] = useState(initialPopularSeries.length === 0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialSeries.length > 0 ? initialSeries.length === SITE.PER_PAGE : true);

  useEffect(() => {
    let isMounted = true;
    const fetchPopular = async () => {
      if (initialPopularSeries.length > 0) {
        idbSet("popular_series_cache", {
          data: initialPopularSeries,
          timestamp: Date.now()
        }).catch(() => {});
        return;
      }
      setIsPopularLoading(true);
      const cacheKey = "popular_series_cache";
      const cached = await idbGet<{ data: Series[]; timestamp: number }>(cacheKey);

      if (cached && cached.timestamp && Date.now() - cached.timestamp < SITE.POPULAR_POST_ID_TTL_SECONDS * 1000) {
        if (isMounted) {
          setPopularSeries(cached.data);
          setIsPopularLoading(false);
        }
        return;
      }

      try {
        const series = await getPopularSeries();
        if (series && series.length > 0) {
          if (isMounted) setPopularSeries(series);
          await idbSet(cacheKey, {
            data: series,
            timestamp: Date.now()
          });
        } else if (cached) {
          if (isMounted) setPopularSeries(cached.data);
        }
      } catch (err) {
        console.error(err);
        if (cached && isMounted) {
          setPopularSeries(cached.data);
        }
      }
      if (isMounted) setIsPopularLoading(false);
    };

    const fetchInitial = async () => {
      if (initialSeries.length === 0) {
        setIsLoading(true);
        const categoryId = await getCategoryId("type-series");
        if (categoryId && isMounted) {
          const series = await getSeriesByCategory(categoryId, 1, SITE.PER_PAGE);
          if (isMounted) {
            setSeriesList(series);
            setHasMore(series.length === SITE.PER_PAGE);
          }
        }
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPopular();
    fetchInitial();
    return () => { isMounted = false; };
  }, [initialSeries.length, initialPopularSeries]);

  const loadMore = async () => {
    setIsLoading(true);
    const categoryId = await getCategoryId("type-series");
    if (categoryId) {
      const nextPage = page + 1;
      const moreSeries = await getSeriesByCategory(categoryId, nextPage, SITE.PER_PAGE);
      if (moreSeries.length > 0) {
        setSeriesList((prev) => [...prev, ...moreSeries]);
        setPage(nextPage);
      }
      if (moreSeries.length < SITE.PER_PAGE) {
        setHasMore(false);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section className="border-t border-border" id="popular">
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">

          {/* Popular Series Section */}
          {(isPopularLoading || popularSeries.length > 0) && (
            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-border/60 pb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold md:text-2xl">Popular Series</h2>
                </div>
              </div>
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {isPopularLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                      <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                        <div className="p-1">
                          <div className="flex flex-col gap-2">
                            <div className="w-full aspect-[2/3] bg-muted animate-pulse rounded-sm" />
                            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      </CarouselItem>
                    ))
                    : popularSeries.map((series, index) => (
                      <CarouselItem key={series.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                        <div className="p-1">
                          <SeriesCard series={series} priority={index < 6} />
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-4" />
                  <CarouselNext className="-right-4" />
                </div>
              </Carousel>
            </div>
          )}

          {/* All Series Section */}
          <div className="space-y-6">
            <div className="border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold md:text-2xl" id="latest">All Series</h2>
            </div>

            {isLoading && seriesList.length === 0 ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="w-full aspect-[2/3] bg-muted animate-pulse rounded-sm" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                {seriesList.map((series, index) => (
                  <div key={series.id}>
                    <SeriesCard series={series} priority={index < 6} />
                  </div>
                ))}
              </div>
            )}

            {hasMore && seriesList.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
