import { SITE } from "@/config/site";
export interface Series {
  id: string;
  title: string;
  author: string;
  cover: string;
  coverWidth?: number;
  coverHeight?: number;
  description: string;
  genres: string[];
  status: "Ongoing" | "Completed";
  rating: number;
  chapters: Chapter[];
  updatedAt: string;
  lastCh: number;
  lastChUpdateAt: number;
  titleAlts?: string[];
  nativeTitle?: string[];
  artist?: string;
  publisher?: string;
  publisherUrl?: string;
  country?: string;
  language?: string;
  year?: string;
  tags?: string[];
  media?: string;
  sameAs?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  number: number;
  publishedAt: string;
  wordCount: number;
  content: string;
}

// --- Minimal IndexedDB Wrapper ---
const DB_NAME = "bozunovel-db";
const STORE_NAME = "wp-cache";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("IndexedDB is not available on server side"));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Get Error:", err);
    return undefined;
  }
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Set Error:", err);
  }
}

// --- WP API Fetching ---

export async function getCategoryId(slug: string): Promise<number | null> {
  const cacheKey = `category_id_${slug}`;
  // 1. Try to get from IndexedDB (Client only)
  if (typeof window !== 'undefined') {
    const cachedId = await idbGet<number>(cacheKey);
    if (cachedId) {
      return cachedId;
    }
  }

  // 2. Fetch from WP API if not cached
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/categories?slug=${slug}&_fields=id`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error("Failed to fetch category");
    const data = await res.json();

    if (data && data.length > 0) {
      const id = data[0].id;
      // 3. Save to IndexedDB (Client only)
      if (typeof window !== 'undefined') {
        await idbSet(cacheKey, id);
      }
      return id;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch category ID:", err);
    return null;
  }
}

function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  };
  return text.replace(/&[#a-z0-9]+;/gi, (match) => {
    if (entities[match.toLowerCase()]) return entities[match.toLowerCase()];
    const numMatch = match.match(/&#(\d+);/);
    if (numMatch) return String.fromCharCode(parseInt(numMatch[1], 10));
    const hexMatch = match.match(/&#x([0-9a-f]+);/i);
    if (hexMatch) return String.fromCharCode(parseInt(hexMatch[1], 16));
    return match;
  });
}

// Mapping WP Post to Series interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWpPostToSeries(post: any): Series {
  const htmlContent = post.content?.rendered || post.content || "";
  const titleStr = post.title?.rendered || post.title || "Unknown Title";
  const title = decodeHtmlEntities(titleStr);
  const postId = post.id || post.ID;

  // Helper for span extraction
  const getSpanText = (className: string, defaultVal: string = "") => {
    const match = htmlContent.match(new RegExp(`<span[^>]*class=["']${className}["'][^>]*>(.*?)<\\/span>`, "i"));
    return match && match[1] ? decodeHtmlEntities(match[1]) : defaultVal;
  };

  // Helper for list extraction
  const getListItems = (className: string): string[] => {
    const ulMatch = htmlContent.match(new RegExp(`<ul[^>]*class=["']${className}["'][^>]*>(.*?)<\\/ul>`, "is"));
    if (!ulMatch || !ulMatch[1]) return [];
    const listHtml = ulMatch[1];
    const items = [];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let match;
    while ((match = liRegex.exec(listHtml)) !== null) {
      if (match[1]) items.push(decodeHtmlEntities(match[1].replace(/<[^>]+>/g, "").trim()));
    }
    return items;
  };

  // Extract cover from <img class="poster" src="...">
  let coverUrl = post.jetpack_featured_media_url || post.featured_image;
  let coverWidth: number | undefined;
  let coverHeight: number | undefined;

  const posterImgMatch = htmlContent.match(/<img[^>]*class=["']poster["'][^>]*>/i) ||
    htmlContent.match(/<img[^>]*src=["'][^"']+["'][^>]*class=["']poster["'][^>]*>/i);

  if (posterImgMatch && posterImgMatch[0]) {
    const imgTag = posterImgMatch[0];
    const widthMatch = imgTag.match(/width=["'](\d+)["']/i);
    const heightMatch = imgTag.match(/height=["'](\d+)["']/i);
    if (widthMatch) coverWidth = parseInt(widthMatch[1], 10);
    if (heightMatch) coverHeight = parseInt(heightMatch[1], 10);
    
    if (!coverUrl) {
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) coverUrl = srcMatch[1];
    }
  }

  if (!coverUrl) {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="100%" height="100%" fill="#1a1a2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="24">Series ${postId}</text></svg>`;
    coverUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;
  }

  // Extract last chapter
  let lastCh = 1;
  let isLastChExplicitlySet = false;

  // 1. First, try to extract from element with class "last-ch-number"
  const lastChNumMatch = htmlContent.match(/<[^>]*\bclass=["'][^"']*?\blast-ch-number\b[^"']*?["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (lastChNumMatch && lastChNumMatch[1]) {
    const rawContent = lastChNumMatch[1].replace(/<[^>]+>/g, '').trim();
    const numMatch = rawContent.match(/[\d.]+/);
    if (numMatch) {
      const num = parseFloat(numMatch[0]);
      if (!isNaN(num)) {
        lastCh = num;
        isLastChExplicitlySet = true;
      }
    }
  }

  // 2. Fallback to the original method (element with class "last-ch")
  if (!isLastChExplicitlySet) {
    const lastChMatch = htmlContent.match(/<[^>]*\bclass=["'][^"']*?\blast-ch\b[^"']*?["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
    if (lastChMatch && lastChMatch[1]) {
      const rawContent = lastChMatch[1].replace(/<[^>]+>/g, '').trim();
      const numMatch = rawContent.match(/[\d.]+/);
      if (numMatch) {
        const num = parseFloat(numMatch[0]);
        if (!isNaN(num)) {
          lastCh = num;
          isLastChExplicitlySet = true;
        }
      }
    }
  }

  // Extract metadata
  const summaryMatch = getSpanText("summary");
  const author = getSpanText("author", "Unknown Author");
  const artist = getSpanText("artist");
  
  let publisher = getSpanText("publisher");
  let publisherUrl: string | undefined;
  const pubMatch = htmlContent.match(/<span[^>]*class=["']publisher["'][^>]*>(.*?)<\/span>/i);
  if (pubMatch && pubMatch[1]) {
    const aMatch = pubMatch[1].match(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
    if (aMatch) {
      publisherUrl = aMatch[1];
      publisher = decodeHtmlEntities(aMatch[2].replace(/<[^>]+>/g, "").trim());
    } else {
      publisher = decodeHtmlEntities(pubMatch[1].replace(/<[^>]+>/g, "").trim());
    }
  }

  const country = getSpanText("country");
  const language = getSpanText("language");
  let status: "Ongoing" | "Completed" = "Ongoing";
  if (post.categories && typeof post.categories === 'object' && !Array.isArray(post.categories)) {
    // WP v1.1 API
    const catKeys = Object.keys(post.categories);
    for (const key of catKeys) {
      const slug = post.categories[key].slug || "";
      if (slug.startsWith("status-")) {
        status = slug === "status-completed" ? "Completed" : "Ongoing";
        break;
      }
    }
  } else if (post._embedded && post._embedded['wp:term']) {
    // WP v2 API with _embed
    const terms = post._embedded['wp:term'];
    for (const taxonomy of terms) {
      if (Array.isArray(taxonomy)) {
        for (const term of taxonomy) {
          if (term.taxonomy === 'category' && term.slug && term.slug.startsWith('status-')) {
            status = term.slug === 'status-completed' ? 'Completed' : 'Ongoing';
            break;
          }
        }
      }
    }
  } else {
    // Fallback to HTML tag
    const statusRaw = getSpanText("status", "Ongoing");
    status = (statusRaw.toLowerCase() === "completed" ? "Completed" : "Ongoing") as "Ongoing" | "Completed";
  }

  const year = getSpanText("year");
  const media = getSpanText("media", "Series");

  const genres = getListItems("genres");
  const tags = getListItems("tag");

  const nativeTitle: string[] = [];
  const normalAlts: string[] = [];
  const titleAltsUlMatch = htmlContent.match(/<ul[^>]*class=["'][^"']*title-alts[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
  if (titleAltsUlMatch && titleAltsUlMatch[1]) {
    const listHtml = titleAltsUlMatch[1];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let match;
    while ((match = liRegex.exec(listHtml)) !== null) {
      if (match[1]) {
        const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, "").trim());
        if (match[0].includes("native-title")) {
          nativeTitle.push(text);
        } else {
          normalAlts.push(text);
        }
      }
    }
  }
  const titleAlts = [...nativeTitle, ...normalAlts];

  let description = summaryMatch || post.excerpt?.rendered || htmlContent;
  description = description.replace(/<[^>]+>/g, "").trim();
  description = decodeHtmlEntities(description);

  // Parse chapters from <pre id="series-meta">
  const chapters: Chapter[] = [];
  const metaMatch = htmlContent.match(/<pre[^>]*id=["']series-meta["'][^>]*>([\s\S]*?)<\/pre>/i);
  if (metaMatch && metaMatch[1]) {
    try {
      const metaJson = JSON.parse(decodeHtmlEntities(metaMatch[1]));
      if (metaJson && metaJson.chapters && Array.isArray(metaJson.chapters)) {
        metaJson.chapters.forEach((chData: (string | number)[]) => {
          // "[0] postId", "[1] chapterNumber", "[2] chapterTitle", "[3] slug", "[4] createdAt"
          if (chData.length >= 5) {
            chapters.push({
              id: String(chData[0]),
              number: typeof chData[1] === "number" ? chData[1] : parseFloat(String(chData[1])),
              title: String(chData[2]),
              publishedAt: String(chData[4]),
              wordCount: 0,
              content: ""
            });
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse series-meta JSON", e);
    }
  }

  const kebabTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const seriesId = `${postId}-${kebabTitle}`;

  if (chapters.length > 0) {
    const maxCh = Math.max(...chapters.map(c => c.number));
    if (!isLastChExplicitlySet && maxCh > lastCh) {
      lastCh = maxCh;
    }
  }

  return {
    id: seriesId,
    title: title,
    author: author,
    cover: coverUrl,
    coverWidth: coverWidth,
    coverHeight: coverHeight,
    description: description,
    genres: genres,
    status: status,
    rating: 0, // No rating provided in metadata snippet, defaulting to 0
    chapters: chapters,
    updatedAt: post.modified || post.date,
    lastCh: lastCh,
    lastChUpdateAt: new Date(post.modified || post.date).getTime(),
    titleAlts: titleAlts,
    nativeTitle: nativeTitle,
    artist: artist,
    publisher: publisher,
    publisherUrl: publisherUrl,
    country: country,
    language: language,
    year: year,
    media: media,
    tags: tags
  };
}

export async function getSeriesByCategory(categoryId: number, page: number = 1, perPage: number = SITE.PER_PAGE): Promise<Series[]> {
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/posts?categories=${categoryId}&orderby=modified&order=desc&per_page=${perPage}&page=${page}&_fields=id,title,content,modified,categories,_links&_embed=wp:term`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error("Failed to fetch series");
    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map(mapWpPostToSeries);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch series:", err);
    return [];
  }
}

export async function searchSeries(
  query: string,
  page: number = 1,
  perPage: number = SITE.PER_PAGE,
  sortBy: string = "terupdate",
  filters?: {
    media?: string[];
    status?: string[];
    releaseYear?: string[];
    genres?: string[];
    tags?: string[];
    author?: string[];
    artist?: string[];
  }
): Promise<Series[]> {
  try {
    let orderByParam = "order_by=modified";
    let orderParam = "&order=DESC";

    if (sortBy === "terbaru") {
      orderByParam = "order_by=date";
      orderParam = "&order=DESC";
    } else if (sortBy === "judul-asc") {
      orderByParam = "order_by=title";
      orderParam = "&order=ASC";
    } else if (sortBy === "judul-desc") {
      orderByParam = "order_by=title";
      orderParam = "&order=DESC";
    }

    let url = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE.ID}/posts?fields=found,ID,title,modified,content,categories&number=${perPage}&page=${page}&${orderByParam}${orderParam}`;

    const categorySlugs: string[] = [];
    if (filters?.media) categorySlugs.push(...filters.media);
    if (filters?.status) categorySlugs.push(...filters.status);
    if (filters?.genres) categorySlugs.push(...filters.genres);
    
    categorySlugs.push("type-series");
    categorySlugs.forEach(c => {
      url += `&category=${c}`;
    });

    const tagSlugs: string[] = [];
    if (filters?.tags) tagSlugs.push(...filters.tags);
    if (filters?.releaseYear) tagSlugs.push(...filters.releaseYear);
    if (filters?.author) tagSlugs.push(...filters.author);
    if (filters?.artist) tagSlugs.push(...filters.artist);

    tagSlugs.forEach(t => {
      url += `&tag=${t}`;
    });

    const searchQuery = query || "";
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to search series");
    const data = await res.json();

    if (data && data.posts && Array.isArray(data.posts)) {
      return data.posts.map(mapWpPostToSeries);
    }
    return [];
  } catch (err) {
    console.error("Failed to search series:", err);
    return [];
  }
}

export async function getSeriesById(slugId: string): Promise<Series | null> {
  if (!slugId || typeof slugId !== "string") return null;
  const numericId = slugId.split("-")[0];
  if (!numericId) return null;
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/posts/${numericId}?_fields=id,title,content,modified,categories,_links&_embed=wp:term`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error("Failed to fetch series by ID");
    const data = await res.json();
    return mapWpPostToSeries(data);
  } catch (err) {
    console.error("Failed to fetch series by ID:", err);
    return null;
  }
}

export async function getPopularSeries(): Promise<Series[]> {
  try {
    const url = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE.ID}/posts/${SITE.POPULAR_POST_ID}?fields=modified,title,content,slug`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch popular series");
    const data = await res.json();

    // Use greedy match [\s\S]* because the HTML content inside the JSON contains inner <pre> tags (like <pre id="series-meta">)
    const match = data.content.match(/<pre[^>]*class=["']popular["'][^>]*>([\s\S]*)<\/pre>/i);
    if (match && match[1]) {
      const decoded = decodeHtmlEntities(match[1]);
      
      try {
        const json = JSON.parse(decoded);
        if (json && json.posts && Array.isArray(json.posts)) {
          return json.posts.map(mapWpPostToSeries);
        }
      } catch {
        // Fallback: If JSON is invalid due to unescaped inner quotes, use a regex parser
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts: any[] = [];
        // Use greedy match [\s\S]* so it finds the LAST bracket instead of stopping at an inner bracket like ]}}
        const postsMatch = decoded.match(/"posts"\s*:\s*\[([\s\S]*)\](?:\s*,\s*"meta"|\s*\})/);
        
        if (postsMatch && postsMatch[1]) {
          const postsStr = postsMatch[1];
          const postRegex = /\{"ID":\s*(\d+)\s*,\s*"modified":\s*"([\s\S]*?)"\s*,\s*"title":\s*"([\s\S]*?)"\s*,\s*"content":\s*"([\s\S]*?)"\}(?=\s*,\s*\{"ID"|$)/g;
          
          let matchPost;
          const unescapeStr = (s: string) => s.replace(/\\"/g, '"')
                                              .replace(/\\n/g, '\n')
                                              .replace(/\\r/g, '\r')
                                              .replace(/\\t/g, '\t')
                                              .replace(/\\\//g, '/')
                                              .replace(/\\\\/g, '\\');
          while ((matchPost = postRegex.exec(postsStr)) !== null) {
            posts.push({
              ID: parseInt(matchPost[1], 10),
              modified: unescapeStr(matchPost[2]),
              title: unescapeStr(matchPost[3]),
              content: unescapeStr(matchPost[4])
            });
          }
          return posts.map(mapWpPostToSeries);
        }
      }
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch popular series:", err);
    return [];
  }
}

export function buildChapterUrl(
  series: { id: string | number; title?: string; slug?: string; seriesUrl?: string },
  chapter: { id: string | number; number: number | string }
): string {
  let seriesSlug = "";

  if (series.seriesUrl) {
    seriesSlug = series.seriesUrl.replace(/^\/series\//, "").replace(/^\//, "");
  } else if (series.slug) {
    seriesSlug = series.slug;
  } else {
    const rawId = series.id ? series.id.toString() : "";
    if (/^\d+-[a-z0-9-]+$/i.test(rawId)) {
      seriesSlug = rawId;
    } else {
      const titleStr = series.title || "";
      const kebabTitle = titleStr
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      seriesSlug = kebabTitle ? `${rawId}-${kebabTitle}` : rawId;
    }
  }

  return `/ch?id=${seriesSlug}-chapter-${chapter.number}-${chapter.id}`;
}
