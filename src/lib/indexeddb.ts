import { SITE } from '@/config/site';

export interface Bookmark {
  id: string;
  title: string;
  cover: string;
  url: string;
  createdAt: number;
}

const DB_NAME = 'BozuNovelDB';
const STORE_NAME = 'bookmarks';
const READ_STORE_NAME = 'read_chapters';
const PROGRESS_STORE_NAME = 'series_progress';
const DB_VERSION = 3;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on the server'));
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(READ_STORE_NAME)) {
        const readStore = db.createObjectStore(READ_STORE_NAME, { keyPath: 'id' });
        readStore.createIndex('seriesId', 'seriesId', { unique: false });
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
        db.createObjectStore(PROGRESS_STORE_NAME, { keyPath: 'seriesId' });
      }
    };
    
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

export const getBookmarks = async (): Promise<Bookmark[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Sort by createdAt descending
        const results = (request.result as Bookmark[]).sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const toggleBookmark = async (bookmark: Omit<Bookmark, 'createdAt'>): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(bookmark.id);
      
      request.onsuccess = () => {
        if (request.result) {
          store.delete(bookmark.id);
          resolve(false); // Removed
        } else {
          store.put({ ...bookmark, createdAt: Date.now() });
          resolve(true); // Added
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

export const isBookmarked = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
};

export interface ReadChapter {
  id: string;
  seriesId: string;
  number: number;
  readAt: number;
}

export const markChapterAsRead = async (chapter: Omit<ReadChapter, 'readAt'>): Promise<void> => {
  try {
    const db = await initDB();
    const numericSeriesId = chapter.seriesId.split('-')[0];
    const chapterData = { ...chapter, seriesId: numericSeriesId };
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(READ_STORE_NAME, 'readwrite');
      const store = tx.objectStore(READ_STORE_NAME);
      
      const request = store.put({ ...chapterData, readAt: Date.now() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error marking chapter as read:', error);
  }
};

export const getReadChapters = async (seriesId: string): Promise<string[]> => {
  try {
    const db = await initDB();
    const numericSeriesId = seriesId.split('-')[0];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(READ_STORE_NAME, 'readonly');
      const store = tx.objectStore(READ_STORE_NAME);
      const index = store.index('seriesId');
      const request = index.getAll(numericSeriesId);
      
      request.onsuccess = () => {
        const chapters = request.result as ReadChapter[];
        resolve(chapters.map(c => c.id));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting read chapters:', error);
    return [];
  }
};

export interface SeriesProgress {
  seriesId: string;
  chapterId: string;
  number: number;
  readAt: number;
}

export const saveSeriesProgress = async (progress: Omit<SeriesProgress, 'readAt'>): Promise<void> => {
  try {
    const db = await initDB();
    const numericSeriesId = progress.seriesId.split('-')[0];
    const progressData = { ...progress, seriesId: numericSeriesId };
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PROGRESS_STORE_NAME);
      
      const request = store.get(numericSeriesId);
      request.onsuccess = () => {
        const existing = request.result as SeriesProgress | undefined;
        if (!existing || progressData.number > existing.number) {
          const putRequest = store.put({ ...progressData, readAt: Date.now() });
          putRequest.onsuccess = () => {
            const countRequest = store.count();
            countRequest.onsuccess = () => {
              if (countRequest.result > SITE.LAST_READ_MAX_POSTS) {
                const getAllRequest = store.getAll();
                getAllRequest.onsuccess = () => {
                  const all = getAllRequest.result as SeriesProgress[];
                  all.sort((a, b) => a.readAt - b.readAt);
                  const toDelete = all.length - SITE.LAST_READ_MAX_POSTS;
                  for (let i = 0; i < toDelete; i++) {
                    store.delete(all[i].seriesId);
                  }
                  resolve();
                };
                getAllRequest.onerror = () => reject(getAllRequest.error);
              } else {
                resolve();
              }
            };
            countRequest.onerror = () => reject(countRequest.error);
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Ignore if reading a lower chapter
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving series progress:', error);
  }
};

export const getSeriesProgress = async (seriesId: string): Promise<SeriesProgress | null> => {
  try {
    const db = await initDB();
    const numericSeriesId = seriesId.split('-')[0];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROGRESS_STORE_NAME, 'readonly');
      const store = tx.objectStore(PROGRESS_STORE_NAME);
      const request = store.get(numericSeriesId);
      
      request.onsuccess = () => resolve(request.result as SeriesProgress || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting series progress:', error);
    return null;
  }
};

export const resetSeriesProgress = async (seriesId: string): Promise<void> => {
  try {
    const db = await initDB();
    const numericSeriesId = seriesId.split('-')[0];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PROGRESS_STORE_NAME);
      const request = store.delete(numericSeriesId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error resetting series progress:', error);
  }
};
