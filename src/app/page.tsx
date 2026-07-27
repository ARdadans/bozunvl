import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { BLOG } from "@/config/site";

export const metadata: Metadata = {
  title: BLOG.TITLE,
  description: BLOG.DESCRIPTION,
  alternates: {
    canonical: BLOG.URL,
  },
  openGraph: {
    url: BLOG.URL,
    images: [
      {
        url: `/apple-touch-icon.png`, // can be absolute if needed
        width: 180,
        height: 180,
        alt: BLOG.TITLE,
      },
    ],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BLOG.TITLE,
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
