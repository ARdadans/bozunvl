import { SITE } from "@/config/site";
export interface Novel {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  genres: string[];
  status: "Ongoing" | "Completed";
  rating: number;
  chapters: Chapter[];
  updatedAt: string;
  lastCh: number;
  lastChUpdateAt: number;
  titleAlts?: string[];
  artist?: string;
  publisher?: string;
  country?: string;
  language?: string;
  year?: string;
  tags?: string[];
  media?: string;
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

export async function idbGet(key: string): Promise<any> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Get Error:", err);
    return undefined;
  }
}

export async function idbSet(key: string, value: any): Promise<void> {
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
    const cachedId = await idbGet(cacheKey);
    if (cachedId) {
      return cachedId;
    }
  }

  // 2. Fetch from WP API if not cached
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/categories?slug=${slug}&_fields=id`;
    const res = await fetch(url);
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
  if (typeof document === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

// Mapping WP Post to Novel interface
function mapWpPostToNovel(post: any): Novel {
  const htmlContent = post.content?.rendered || "";
  const title = decodeHtmlEntities(post.title?.rendered || "Unknown Title");

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
  let coverUrl = post.jetpack_featured_media_url;
  if (!coverUrl) {
    const posterMatch = htmlContent.match(/<img[^>]*class=["']poster["'][^>]*src=["']([^"']+)["']/i) ||
      htmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*class=["']poster["']/i);
    if (posterMatch && posterMatch[1]) {
      coverUrl = posterMatch[1];
    } else {
      coverUrl = `https://placehold.co/300x450/1a1a2e/ffffff?text=Novel+${post.id}`;
    }
  }

  // Extract last chapter from <p class="last-ch">20</p>
  let lastCh = 1;
  const lastChMatch = htmlContent.match(/<p[^>]*class=["']last-ch["'][^>]*>\s*(\d+)\s*<\/p>/i);
  if (lastChMatch && lastChMatch[1]) {
    lastCh = parseInt(lastChMatch[1], 10);
  }

  // Extract metadata
  const summaryMatch = getSpanText("summary");
  const author = getSpanText("author", "Unknown Author");
  const artist = getSpanText("artist");
  const publisher = getSpanText("publisher");
  const country = getSpanText("country");
  const language = getSpanText("language");
  const statusRaw = getSpanText("status", "Ongoing");
  const status = (statusRaw.toLowerCase() === "completed" ? "Completed" : "Ongoing") as "Ongoing" | "Completed";
  const year = getSpanText("year");
  const media = getSpanText("media", "Novel");

  const titleAlts = getListItems("title-alts");
  const genres = getListItems("genres");
  const tags = getListItems("tag");

  let description = summaryMatch || post.excerpt?.rendered || htmlContent;
  description = description.replace(/<[^>]+>/g, "").trim();
  description = decodeHtmlEntities(description);

  // Parse chapters from <pre id="series-meta">
  const chapters = [];
  const metaMatch = htmlContent.match(/<pre[^>]*id=["']series-meta["'][^>]*>(.*?)<\/pre>/is);
  if (metaMatch && metaMatch[1]) {
    try {
      const metaJson = JSON.parse(decodeHtmlEntities(metaMatch[1]));
      if (metaJson && metaJson.chapters && Array.isArray(metaJson.chapters)) {
        metaJson.chapters.forEach((chData: any[]) => {
          // "[0] postId", "[1] chapterNumber", "[2] chapterTitle", "[3] slug", "[4] createdAt"
          if (chData.length >= 5) {
            chapters.push({
              id: String(chData[0]),
              number: parseFloat(chData[1]),
              title: chData[2],
              publishedAt: chData[4],
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
  const novelId = `${post.id}-${kebabTitle}`;

  return {
    id: novelId,
    title: title,
    author: author,
    cover: coverUrl,
    description: description,
    genres: genres,
    status: status,
    rating: 0, // No rating provided in metadata snippet, defaulting to 0
    chapters: chapters,
    updatedAt: post.modified || post.date,
    lastCh: lastCh,
    lastChUpdateAt: new Date(post.modified || post.date).getTime(),
    titleAlts: titleAlts,
    artist: artist,
    publisher: publisher,
    country: country,
    language: language,
    year: year,
    media: media,
    tags: tags
  };
}

export async function getSeriesByCategory(categoryId: number, page: number = 1, perPage: number = SITE.PER_PAGE): Promise<Novel[]> {
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/posts?categories=${categoryId}&orderby=modified&order=desc&per_page=${perPage}&page=${page}&_fields=id,title,content,modified`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch series");
    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map(mapWpPostToNovel);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch series:", err);
    return [];
  }
}

export async function getSeriesById(slugId: string): Promise<Novel | null> {
  if (!slugId || typeof slugId !== "string") return null;
  const numericId = slugId.split("-")[0];
  if (!numericId) return null;
  try {
    const url = `${SITE.API_REST}/${SITE.ID}/posts/${numericId}?_fields=id,title,content,modified`;
    const res = await fetch(url, { next: { tags: ['series', slugId] } });
    if (!res.ok) throw new Error("Failed to fetch series by ID");
    const data = await res.json();
    return mapWpPostToNovel(data);
  } catch (err) {
    console.error("Failed to fetch series by ID:", err);
    return null;
  }
}
