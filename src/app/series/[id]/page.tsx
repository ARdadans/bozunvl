import { getSeriesById, buildChapterUrl } from "@/lib/wp";
import SeriesClient from "./SeriesClient";
import { SITE, BLOG } from "@/config/site";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  try {
    // 1. Get Category ID for "series"
    const catUrl = `${SITE.API_REST}/${SITE.ID}/categories?slug=type-series&_fields=id`;
    const catRes = await fetch(catUrl);
    if (!catRes.ok) return [];
    const catData = await catRes.json();

    if (!catData || catData.length === 0) return [];
    const categoryId = catData[0].id;

    // 2. Fetch all posts
    let allPosts: Array<{ id: number | string; title?: { rendered?: string } }> = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${SITE.API_REST}/${SITE.ID}/posts?categories=${categoryId}&orderby=modified&order=desc&per_page=100&page=${page}&_fields=id,title`;
      const res = await fetch(url);
      if (!res.ok) {
        break;
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        allPosts = [...allPosts, ...data];
        page++;
      } else {
        hasMore = false;
      }
    }

    if (allPosts.length > 0) {
      return allPosts.map((post) => {
        const title = post.title?.rendered || "";
        const kebabTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const seriesId = `${post.id}-${kebabTitle}`;
        return {
          id: seriesId,
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Failed to generate static params:", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeriesById(id);

  if (!series) {
    return {
      title: "Series Not Found",
    };
  }

  const cleanDescription = series.description?.replace(/<[^>]+>/g, '').substring(0, 160) || `Baca seriesItem ${series.title} di ${BLOG.TITLE}`;

  return {
    title: series.title,
    description: cleanDescription,
    alternates: {
      canonical: `${BLOG.URL}/series/${id}`,
    },
    openGraph: {
      title: series.title,
      description: cleanDescription,
      url: `${BLOG.URL}/series/${id}`,
      images: [
        {
          url: series.cover || `${BLOG.URL}/apple-touch-icon.png`,
          width: series.coverWidth || 300,
          height: series.coverHeight || 450,
          alt: series.title,
        },
      ],
    },
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesById(id);

  if (!series) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-[var(--color-foreground)]">
        <h1 className="font-heading text-2xl font-bold">Series not found</h1>
        <p className="mt-4 text-[var(--color-muted-foreground)]">The series you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-primary-hover)] font-bold py-2.5 px-5 rounded-[var(--radius)]"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const chaptersForSchema = series.chapters || [];
  const schemaChapters = chaptersForSchema.length <= 6
    ? chaptersForSchema
    : [...chaptersForSchema.slice(0, 3), ...chaptersForSchema.slice(-3)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWorkSeries",
        "@id": `${BLOG.URL}/series/${id}#series`,
        "url": `${BLOG.URL}/series/${id}`,
        "name": series.title,
        ...(series.titleAlts && series.titleAlts.length > 0 ? { "alternateName": series.titleAlts } : {}),
        "description": series.description?.replace(/<[^>]+>/g, '') || `Baca series ${series.title} di ${BLOG.TITLE}`,
        "image": {
          "@type": "ImageObject",
          "url": series.cover,
          "width": series.coverWidth || 300,
          "height": series.coverHeight || 450
        },
        "inLanguage": "id",
        "creativeWorkStatus": series.status,
        "genre": series.genres?.length > 0 ? series.genres : undefined,
        "author": {
          "@type": "Person",
          "name": series.author || "Unknown"
        },
        "publisher": {
          "@type": "Organization",
          "name": series.publisher || BLOG.TITLE,
          "url": series.publisherUrl || BLOG.URL,
        },
        "datePublished": series.chapters && series.chapters.length > 0 ? series.chapters[series.chapters.length - 1].publishedAt : series.updatedAt,
        "dateModified": series.updatedAt,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BLOG.URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": series.title,
            "item": `${BLOG.URL}/series/${id}`
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": `Daftar Chapter - ${series.title}`,
        "description": "Beberapa chapter dari series ini",
        "numberOfItems": series.chapters?.length || 0,
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": schemaChapters.map((ch, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": ch.title || `Chapter ${ch.number}`,
          "url": `${BLOG.URL}${buildChapterUrl({ id, title: series.title }, ch)}`
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeriesClient series={series} />
    </>
  );
}
