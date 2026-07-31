import { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

export const dynamic = "force-static";

type WPPost = {
  ID: number;
  modified: string;
  title: string;
};

type WPResponse = {
  found: number;
  posts: WPPost[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;
  let totalFound = 0;

  while (hasMore) {
    try {
      const res = await fetch(
        `https://public-api.wordpress.com/rest/v1.2/sites/${SITE.NAME}/posts?category=type-series&fields=found,ID,modified,title&order_by=modified&number=100&page=${page}`,
        { cache: 'force-cache' }
      );

      if (!res.ok) {
        console.error(`Failed to fetch sitemap data on page ${page}`);
        break;
      }

      const data: WPResponse = await res.json();

      if (page === 1) {
        totalFound = data.found;
      }

      if (data.posts && data.posts.length > 0) {
        allPosts = [...allPosts, ...data.posts];
      }

      // Cek apakah jumlah posts yang diambil sudah sesuai dengan total found
      if (allPosts.length < totalFound && data.posts && data.posts.length > 0) {
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching sitemap data on page ${page}:`, error);
      hasMore = false;
    }
  }

  const seriesEntries: MetadataRoute.Sitemap = allPosts.map((post) => {
    const titleStr = post.title || '';
    const kebabTitle = titleStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const seriesId = `${post.ID}-${kebabTitle}`;

    return {
      url: `${baseUrl}/series/${seriesId}`,
      lastModified: new Date(post.modified),
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...seriesEntries,
  ];
}
