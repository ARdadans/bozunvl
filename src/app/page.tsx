import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { BLOG, SITE } from "@/config/site";
import { getPopularSeries, getCategoryId, getSeriesByCategory } from "@/lib/wp";

export const metadata: Metadata = {
  title: BLOG.TITLE_LONG,
  description: BLOG.DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    images: [
      {
        url: `/apple-touch-icon.png`, // can be absolute if needed
        width: 512,
        height: 512,
        alt: BLOG.TITLE_LONG,
      },
    ],
  },
};

export default async function Page() {
  const popularSeries = await getPopularSeries();
  const categoryId = await getCategoryId("type-series");
  const latestSeries = categoryId ? await getSeriesByCategory(categoryId, 1, SITE.PER_PAGE) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "WebSite",
      "name": BLOG.TITLE_LONG,
      "url": BLOG.URL,
      "description": BLOG.DESCRIPTION,
      "inLanguage": BLOG.LOCALE,
      "@id": `${BLOG.URL}/#website`,
      "publisher": { "@id": `${BLOG.URL}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BLOG.URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${BLOG.URL}/#organization`,
      "name": BLOG.TITLE,
      "url": `${BLOG.URL}`,
      "logo": {
        "@type": "ImageObject",
        "url": `${BLOG.URL}/apple-touch-icon.png`
      }
    },
    {
      "@type": "WebPage",
      "@id": `${BLOG.URL}/#webpage`,
      "url": `${BLOG.URL}`,
      "name": `${BLOG.TITLE_LONG}`,
      "isPartOf": {
        "@id": `${BLOG.URL}/#website`
      },
      "mainEntity": [
        {
          "@id": `${BLOG.URL}/#popular`
        },
        {
          "@id": `${BLOG.URL}/#latest`
        }
      ]
    },
    ...(popularSeries.length > 0 ? [
      {
        "@type": "ItemList",
        "@id": `${BLOG.URL}/#popular`,
        "name": "Novel Populer",
        "numberOfItems": Math.min(5, popularSeries.length),
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "itemListElement": popularSeries.slice(0, 5).map((series, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@id": `${BLOG.URL}/series/${series.id}#book`
          }
        }))
      },
      ...popularSeries.slice(0, 5).map((series) => ({
        "@type": "Book",
        "@id": `${BLOG.URL}/series/${series.id}#book`,
        "name": series.title,
        "url": `${BLOG.URL}/series/${series.id}`
      }))
    ] : []),
    ...(latestSeries.length > 0 ? [
      {
        "@type": "ItemList",
        "@id": `${BLOG.URL}/#latest`,
        "name": "Novel Terbaru",
        "numberOfItems": Math.min(5, latestSeries.length),
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "itemListElement": latestSeries.slice(0, 5).map((series, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@id": `${BLOG.URL}/series/${series.id}#book`
          }
        }))
      },
      ...latestSeries.slice(0, 5).map((series) => ({
        "@type": "Book",
        "@id": `${BLOG.URL}/series/${series.id}#book`,
        "name": series.title,
        "url": `${BLOG.URL}/series/${series.id}`
      }))
    ] : [])
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HomeClient initialPopularSeries={popularSeries} initialSeries={latestSeries} />
    </>
  );
}
