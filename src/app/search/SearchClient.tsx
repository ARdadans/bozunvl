"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter, Loader2, LayoutGrid, LayoutList } from "lucide-react";
import { Series, searchSeries, idbGet, idbSet } from "@/lib/wp";
import { SeriesCard } from "@/components/series/series-card";
import { SeriesCardRow } from "@/components/series/series-card-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { SITE } from "@/config/site";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQuery = searchParams.get("q") || "";
  const initialSortBy = searchParams.get("sort") || "terupdate";

  const getArrayParam = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  const initialMedia = getArrayParam("media");
  const initialStatus = getArrayParam("status");
  const initialYear = getArrayParam("year");
  const initialGenres = getArrayParam("genres");
  const initialTags = getArrayParam("tags");
  const initialAuthor = getArrayParam("author");
  const initialArtist = getArrayParam("artist");

  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [appliedSortBy, setAppliedSortBy] = useState(initialSortBy);
  const [hasMore, setHasMore] = useState(true);

  // Layout state: 'grid' or 'list'
  const [layout, setLayout] = useState<"grid" | "list">("list");

  // Filter states (for UI)
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [media, setMedia] = useState<string[]>(initialMedia);
  const [mediaOptions, setMediaOptions] = useState<{ value: string, label: string }[]>([]);
  const [status, setStatus] = useState<string[]>(initialStatus);
  const [statusOptions, setStatusOptions] = useState<{ value: string, label: string }[]>([]);
  const [releaseYear, setReleaseYear] = useState<string[]>(initialYear);
  const [releaseYearOptions, setReleaseYearOptions] = useState<{ value: string, label: string }[]>([]);
  const [genres, setGenres] = useState<string[]>(initialGenres);
  const [genresOptions, setGenresOptions] = useState<{ value: string, label: string }[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagsOptions, setTagsOptions] = useState<{ value: string, label: string }[]>([]);
  const [author, setAuthor] = useState<string[]>(initialAuthor);
  const [authorOptions, setAuthorOptions] = useState<{ value: string, label: string }[]>([]);
  const [artist, setArtist] = useState<string[]>(initialArtist);
  const [artistOptions, setArtistOptions] = useState<{ value: string, label: string }[]>([]);

  // Applied filter states (for fetching)
  const [appliedMedia, setAppliedMedia] = useState<string[]>(initialMedia);
  const [appliedStatus, setAppliedStatus] = useState<string[]>(initialStatus);
  const [appliedReleaseYear, setAppliedReleaseYear] = useState<string[]>(initialYear);
  const [appliedGenres, setAppliedGenres] = useState<string[]>(initialGenres);
  const [appliedTags, setAppliedTags] = useState<string[]>(initialTags);
  const [appliedAuthor, setAppliedAuthor] = useState<string[]>(initialAuthor);
  const [appliedArtist, setAppliedArtist] = useState<string[]>(initialArtist);
  const [isFetchingFilters, setIsFetchingFilters] = useState(false);
  const [hasFetchedFilters, setHasFetchedFilters] = useState(false);

  const fetchFilters = async () => {
    if (hasFetchedFilters || isFetchingFilters) return;
    setIsFetchingFilters(true);

    try {
      const fetchTaxonomy = async (type: 'categories' | 'tags') => {
        let allItems: Array<{ slug: string }> = [];
        let page = 1;
        let totalFound = Infinity;
        let fetchedCount = 0;

        while (fetchedCount < totalFound) {
          const url = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE.ID}/${type}?fields=slug&number=100&page=${page}`;
          const res = await fetch(url);
          if (!res.ok) break;
          const data = await res.json();

          if (data && data[type]) {
            allItems = [...allItems, ...data[type]];
            fetchedCount += data[type].length;
          } else {
            break;
          }

          if (data && typeof data.found === 'number') {
            totalFound = data.found;
          } else {
            break;
          }

          if (data[type].length < 100) break;
          page++;
          if (page > 20) break; // safety limit
        }
        return allItems;
      };

      const [categories, tagsData] = await Promise.all([
        fetchTaxonomy('categories'),
        fetchTaxonomy('tags')
      ]);

      const mediaList: { value: string, label: string }[] = [];
      const statusList: { value: string, label: string }[] = [];
      const genreList: { value: string, label: string }[] = [];

      categories.forEach((cat) => {
        if (!cat.slug) return;
        const slugLower = cat.slug.toLowerCase();

        if (slugLower.startsWith("media-")) {
          mediaList.push({
            value: cat.slug,
            label: cat.slug.substring(6).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        } else if (slugLower.startsWith("status-")) {
          statusList.push({
            value: cat.slug,
            label: cat.slug.substring(7).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        } else if (!slugLower.startsWith("type-")) {
          genreList.push({
            value: cat.slug,
            label: cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        }
      });

      const yearList: { value: string, label: string }[] = [];
      const tagList: { value: string, label: string }[] = [];
      const authorList: { value: string, label: string }[] = [];
      const artistList: { value: string, label: string }[] = [];

      tagsData.forEach((tag) => {
        if (!tag.slug) return;
        const slugLower = tag.slug.toLowerCase();

        if (slugLower.startsWith("year-")) {
          yearList.push({
            value: tag.slug,
            label: tag.slug.substring(5).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        } else if (slugLower.startsWith("author-")) {
          authorList.push({
            value: tag.slug,
            label: tag.slug.substring(7).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        } else if (slugLower.startsWith("artist-")) {
          artistList.push({
            value: tag.slug,
            label: tag.slug.substring(7).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        } else if (slugLower.startsWith("tag-")) {
          tagList.push({
            value: tag.slug,
            label: tag.slug.substring(4).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          });
        }
      });

      setMediaOptions(mediaList);
      setStatusOptions(statusList);
      setGenresOptions(genreList);

      setReleaseYearOptions(yearList);
      setTagsOptions(tagList);
      setAuthorOptions(authorList);
      setArtistOptions(artistList);

      setHasFetchedFilters(true);
    } catch (err) {
      console.error("Failed to fetch filters", err);
    } finally {
      setIsFetchingFilters(false);
    }
  };

  // Function to load initial data or data on query change
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const results = await searchSeries(appliedQuery, 1, SITE.PER_PAGE, appliedSortBy, {
        media: appliedMedia,
        status: appliedStatus,
        releaseYear: appliedReleaseYear,
        genres: appliedGenres,
        tags: appliedTags,
        author: appliedAuthor,
        artist: appliedArtist
      });
      setSeriesList(results);
      setPage(1);
      setHasMore(results.length === SITE.PER_PAGE);
      setIsLoading(false);

      if (appliedQuery.trim() && results.length > 0 && typeof window !== 'undefined') {
        try {
          const currentSearches = (await idbGet<string[]>("recent_searches")) || [];
          const queryTrimmed = appliedQuery.trim();
          let updatedSearches = currentSearches.filter((q: string) => q !== queryTrimmed);
          updatedSearches.unshift(queryTrimmed);
          if (updatedSearches.length > 5) {
            updatedSearches = updatedSearches.slice(0, 5);
          }
          await idbSet("recent_searches", updatedSearches);
        } catch (e) {
          console.error("Failed to save recent search", e);
        }
      }
    }

    loadData();
  }, [appliedQuery, appliedSortBy, appliedMedia, appliedStatus, appliedReleaseYear, appliedGenres, appliedTags, appliedAuthor, appliedArtist]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const moreSeries = await searchSeries(appliedQuery, nextPage, SITE.PER_PAGE, appliedSortBy, {
      media: appliedMedia,
      status: appliedStatus,
      releaseYear: appliedReleaseYear,
      genres: appliedGenres,
      tags: appliedTags,
      author: appliedAuthor,
      artist: appliedArtist
    });
    if (moreSeries.length > 0) {
      setSeriesList((prev) => [...prev, ...moreSeries]);
      setPage(nextPage);
    }
    if (moreSeries.length < SITE.PER_PAGE) {
      setHasMore(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedQuery(inputValue);
    setAppliedSortBy(sortBy);
    setAppliedMedia(media);
    setAppliedStatus(status);
    setAppliedReleaseYear(releaseYear);
    setAppliedGenres(genres);
    setAppliedTags(tags);
    setAppliedAuthor(author);
    setAppliedArtist(artist);

    // Update URL without full reload
    const params = new URLSearchParams();
    if (inputValue) params.set("q", inputValue);
    if (sortBy !== "terupdate") params.set("sort", sortBy);
    if (media.length > 0) params.set("media", media.join(","));
    if (status.length > 0) params.set("status", status.join(","));
    if (releaseYear.length > 0) params.set("year", releaseYear.join(","));
    if (genres.length > 0) params.set("genres", genres.join(","));
    if (tags.length > 0) params.set("tags", tags.join(","));
    if (author.length > 0) params.set("author", author.join(","));
    if (artist.length > 0) params.set("artist", artist.join(","));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setInputValue("");
    setSortBy("terupdate");
    setMedia([]);
    setStatus([]);
    setReleaseYear([]);
    setGenres([]);
    setTags([]);
    setAuthor([]);
    setArtist([]);

    setAppliedQuery("");
    setAppliedSortBy("terupdate");
    setAppliedMedia([]);
    setAppliedStatus([]);
    setAppliedReleaseYear([]);
    setAppliedGenres([]);
    setAppliedTags([]);
    setAppliedAuthor([]);
    setAppliedArtist([]);

    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-6">

          {/* 1. Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search series by title..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" className="h-12 px-8 text-base">
              Search
            </Button>
          </form>

          {/* 2. Filter Box */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div
              className="flex items-center justify-between cursor-pointer mb-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-bold text-lg">Filters</h2>
              </div>
              <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </span>
            </div>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isFilterOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Filter Selects */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full min-h-9 h-auto py-1.5 px-3 bg-transparent">
                          <div className="flex items-center gap-1 flex-1 overflow-hidden">
                            <Badge variant="secondary" className="rounded-sm px-1.5 font-normal flex items-center gap-1 shrink-0 max-w-[120px]">
                              <span className="truncate"><SelectValue placeholder="Sort By" /></span>
                            </Badge>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="terupdate">Terupdate</SelectItem>
                          <SelectItem value="terbaru">Terbaru</SelectItem>
                          <SelectItem value="judul-asc">Judul (A - Z)</SelectItem>
                          <SelectItem value="judul-desc">Judul (Z - A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Media</label>
                      <MultiSelect
                        options={mediaOptions}
                        value={media}
                        onChange={setMedia}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Media"}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <MultiSelect
                        options={statusOptions}
                        value={status}
                        onChange={setStatus}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Status"}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Release Year</label>
                      <MultiSelect
                        options={releaseYearOptions}
                        value={releaseYear}
                        onChange={setReleaseYear}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Year"}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Genres</label>
                      <MultiSelect
                        options={genresOptions}
                        value={genres}
                        onChange={setGenres}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Genre"}
                        searchable={true}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Tags</label>
                      <MultiSelect
                        options={tagsOptions}
                        value={tags}
                        onChange={setTags}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Tag"}
                        searchable={true}
                        creatable={true}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Author</label>
                      <MultiSelect
                        options={authorOptions}
                        value={author}
                        onChange={setAuthor}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Author"}
                        searchable={true}
                        creatable={true}
                        isGrid={true}
                      />
                    </div>
                    <div className="space-y-1.5" onClick={() => fetchFilters()}>
                      <label className="text-xs font-medium text-muted-foreground">Artist</label>
                      <MultiSelect
                        options={artistOptions}
                        value={artist}
                        onChange={setArtist}
                        placeholder={isFetchingFilters ? "Loading..." : "Any Artist"}
                        searchable={true}
                        creatable={true}
                        isGrid={true}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-border/60 pt-4 mt-2">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                    <Button onClick={() => handleSearch()}>
                      Filter Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Results Header & Post List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mt-4">
              <h1 className="font-heading text-xl font-bold md:text-2xl">
                {appliedQuery ? `Search Results for "${appliedQuery}"` : "All Series"}
              </h1>

              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/40">
                <button
                  onClick={() => setLayout("list")}
                  className={`p-1.5 rounded-sm transition-colors ${layout === "list" ? "bg-background shadow-sm text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="List view"
                  title="List View"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-1.5 rounded-sm transition-colors ${layout === "grid" ? "bg-background shadow-sm text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading && seriesList.length === 0 ? (
              <div className={`grid gap-3 ${layout === 'grid' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2'}`}>
                {Array.from({ length: layout === 'grid' ? 12 : 6 }).map((_, i) => (
                  <div key={i} className={`flex ${layout === 'grid' ? 'flex-col gap-2' : 'gap-3 bg-card border border-border/40 p-2 rounded-md'}`}>
                    <div className={`${layout === 'grid' ? 'w-full aspect-[2/3]' : 'w-16 md:w-20 aspect-[2/3] shrink-0'} bg-muted animate-pulse rounded-sm`} />
                    <div className={`flex-1 flex flex-col ${layout === 'grid' ? 'gap-2' : 'gap-2 py-1'}`}>
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      {layout === 'list' && (
                        <div className="mt-auto h-3 w-1/3 bg-muted animate-pulse rounded" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : seriesList.length > 0 ? (
              <div className={`grid gap-3 ${layout === 'grid' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2'}`}>
                {seriesList.map((series) => (
                  <div key={series.id}>
                    {layout === 'grid' ? (
                      <SeriesCard series={series} />
                    ) : (
                      <SeriesCardRow series={series} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-heading text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground text-sm">
                  We couldn&apos;t find any series matching your filters. Try using different keywords or resetting filters.
                </p>
                <Button variant="outline" className="mt-6" onClick={handleResetFilters}>
                  Clear Search & Filters
                </Button>
              </div>
            )}

            {hasMore && seriesList.length > 0 && !isLoading && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                >
                  Load More
                </Button>
              </div>
            )}

            {isLoading && seriesList.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SearchContent;
