"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Series, buildChapterUrl } from "@/lib/wp";

interface SeriesHeaderProps {
  series: Series;
}

export function SeriesHeader({ series }: SeriesHeaderProps) {
  const router = useRouter();
  const firstChapter = series.chapters[0];
  const firstChapterUrl = firstChapter ? buildChapterUrl(series, firstChapter) : "#";

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

      <div className="container relative mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0">
            <Card className="overflow-hidden border-2 p-1">
              <Image
                src={series.cover}
                alt={series.title}
                width={224}
                height={320}
                unoptimized
                className="h-64 w-48 object-cover md:h-80 md:w-56"
              />
            </Card>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Link>
            </div>

            <h1 className="font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
              {series.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {series.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {series.rating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {series.updatedAt}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {series.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              <Badge variant={series.status === "Ongoing" ? "default" : "outline"}>{series.status}</Badge>
            </div>

            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              {series.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" onClick={() => router.push(firstChapterUrl)}>
                <BookOpen className="h-4 w-4" />
                Start Reading
              </Button>
              <Button variant="outline" size="lg">
                Add to Library
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
