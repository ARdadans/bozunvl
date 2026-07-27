"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chapter } from "@/lib/wp";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  seriesId: string;
  chapters: Chapter[];
}

export function ChapterList({ seriesId, chapters }: ChapterListProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {chapters.map((chapter) => (
          <div key={chapter.id}>
            <Link href={`/series/${seriesId}/ch/${chapter.id}`}>
              <Card
                className={cn(
                  "group flex items-center justify-between p-4 transition-all hover:border-primary/50 hover:shadow-md",
                  "cursor-pointer"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors md:text-lg">
                      {chapter.number}. {chapter.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {chapter.wordCount.toLocaleString()} words • <RelativeTime date={chapter.publishedAt} />
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Read
                </Badge>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
