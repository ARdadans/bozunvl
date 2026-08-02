import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { BLOG } from "@/config/site";

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

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BLOG.TITLE_LONG,
    "url": BLOG.URL,
    "description": BLOG.DESCRIPTION,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
