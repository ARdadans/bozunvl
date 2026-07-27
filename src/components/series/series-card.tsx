"use client";

import Link from "next/link";
import { Novel } from "@/lib/wp";
import { RelativeTime } from "@/components/ui/relative-time";

interface SeriesCardProps {
  series: Novel;
  index?: number;
}

export function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  return (
    <div>
      <Link href={`/series/${series.id}`}>
        <div className="group flex flex-col h-full overflow-hidden">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={series.cover}
              alt={series.title}
              className="h-full w-full object-cover rounded-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
          </div>
          <div className="px-0.5">
            <div className="flex items-center mt-1 justify-between text-xs text-muted-foreground whitespace-nowrap overflow-hidden">
              <span className="truncate max-w-[60%]">
                Ch. {series.lastCh}
              </span>
              <RelativeTime
                date={series.lastChUpdateAt}
                className="shrink-0 text-muted-foreground/80"
              />
            </div>
            <h3 className="mt-0.5 font-heading font-bold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 ease-out leading-tight">
              {series.title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
}

