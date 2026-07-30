"use client";

import Link from "next/link";
import { Series } from "@/lib/wp";
import { RelativeTime } from "@/components/ui/relative-time";

interface SeriesCardRowProps {
  series: Series;
}

export function SeriesCardRow({ series }: SeriesCardRowProps) {
  let summaryText = "";
  if (series.description) {
    const match = series.description.match(/<span[^>]*class=["']?summary["']?[^>]*>(.*?)<\/span>/i);
    summaryText = match ? match[1] : series.description;
    summaryText = summaryText.replace(/<\/?[^>]+(>|$)/g, "").trim();
  }

  const infoText = [
    `Ch. ${series.lastCh || '?'}`,
    series.author,
    series.status,
    series.year
  ].filter(Boolean).join(" â€¢ ");

  return (
    <Link href={`/series/${series.id}`} className="group block h-full">
      <div className="flex gap-3 h-full overflow-hidden p-2 transition-colors hover:bg-muted/40">
        <div className="relative w-16 md:w-20 shrink-0 aspect-[2/3] overflow-hidden rounded-sm">
          <img
            src={series.cover}
            alt={series.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
          <h3 className="font-heading font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors leading-tight">
            {series.title}
          </h3>
          
          <div className="text-[11px] text-muted-foreground truncate">
            {infoText}
          </div>

          {summaryText && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-0.5">
              {summaryText}
            </p>
          )}

          <div className="mt-auto text-[11px] text-muted-foreground/70 flex items-center">
            <RelativeTime date={series.lastChUpdateAt} />
          </div>
        </div>
      </div>
    </Link>
  );
}
