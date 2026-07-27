"use client";

import Link from "next/link";
import { BookOpen, Search, Bolt, Menu, X } from "lucide-react";
import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BLOG } from "@/config/site";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";


function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function SearchDialogContent({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const results: any[] = [];

  return (
    <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 border-none bg-transparent shadow-none">
      <div className="w-full rounded-lg border bg-background p-6 shadow-lg">
        <Input
          autoFocus
          placeholder="Search any..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 text-base md:text-lg focus-visible:ring-0 focus-visible:outline-none focus-visible:border-input"
        />
        {results.length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto">
            {results.map((novel) => (
              <Link
                key={novel.id}
                href={`/series/${novel.id}`}
                onClick={onClose}
                className="block rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <p className="text-sm font-medium md:text-base">{novel.title}</p>
                <p className="text-xs text-muted-foreground md:text-sm">{novel.author}</p>
              </Link>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground md:text-base">
            No novels found.
          </p>
        )}
      </div>
    </DialogContent>
  );
}

function SearchDrawerContent({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const results: any[] = [];

  return (
    <DrawerContent className="mx-auto mt-4 max-h-[70vh] rounded-t-xl">
      <DrawerHeader>
        <DrawerTitle className="font-heading text-base font-medium">
          Search...
        </DrawerTitle>
      </DrawerHeader>
      <div className="px-4 mb-30">
        <Input
          autoFocus
          placeholder="Search anytest..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 text-base focus-visible:ring-0 focus-visible:outline-none focus-visible:border-input"
        />
        {results.length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto">
            {results.map((novel) => (
              <Link
                key={novel.id}
                href={`/series/${novel.id}`}
                onClick={onClose}
                className="block rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <p className="text-sm font-medium">{novel.title}</p>
                <p className="text-xs text-muted-foreground">{novel.author}</p>
              </Link>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No novels found.
          </p>
        )}
      </div>
    </DrawerContent>
  );
}

// Buttons are inlined in SiteHeader to coordinate search triggers responsive state.

function BoltDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button title="Settings" className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Bolt className="h-5 w-5" />
          <span className="sr-only">Quick Actions</span>
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none">
        <div className="relative w-full rounded-lg border bg-background p-6 shadow-lg">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none hover:bg-accent hover:text-accent-foreground p-1">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-base font-medium">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Quickly access your favorite features.
              </p>
            </div>
            <div className="grid gap-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted"
              >
                <Bolt className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Featured Novels</p>
                  <p className="text-xs text-muted-foreground">
                    Explore trending stories
                  </p>
                </div>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Trending</p>
                  <p className="text-xs text-muted-foreground">
                    What others are reading
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MenuDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button title="Menu" className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none">
        <div className="relative w-full rounded-lg border bg-background p-6 shadow-lg">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none hover:bg-accent hover:text-accent-foreground p-1">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-base font-medium">Menu</h3>
              <p className="text-sm text-muted-foreground">
                Navigate through the site.
              </p>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SiteHeader({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pathname = usePathname();
  if (pathname && pathname.includes("/ch/")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:rotate-6 hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#fff" d="M861 592.9c-107.4.2-129 53.8-215.1 53.8-86.3 0-107.8-53.9-188.7-53.9s-102.4 54-188.6 54c-45.9 0-73.5-15.3-105.5-29.6 16.7 144 135.2 245.1 294.1 245.1H565c167.8 0 290.3-112.7 296-269.4" /><path fill="#231f20" d="M619.8 862.3H404.2c-171.8 0-296.4-118-296.4-280.5C107.8 428 218 339 306.5 267.4c67-54 124.7-100.7 124.7-159.6H485c0 84.7-70.3 141.4-144.7 201.5-87.8 71-178.7 144.4-178.7 272.5 0 133.4 99.7 226.6 242.5 226.6h215.6c142.8 0 242.5-93.2 242.5-226.6 0-128-90.9-201.5-178.7-272.5-74.4-60-144.7-116.8-144.7-201.5h54c0 59 57.7 105.6 124.6 159.6C806 338.9 916.2 428 916.2 581.8c0 162.5-124.6 280.5-296.4 280.5m2.8-392.1-80.8-161.7 48.2-24.2L670.8 446zm-221.2 0L353.2 446 434 284.3l48.2 24.2z" /></svg>
          </div>
          <span className="font-bold text-lg font-logo">
            {BLOG.TITLE}
          </span>
        </Link>

        <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-sm items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 text-muted-foreground transition-colors hover:bg-muted cursor-pointer md:text-base"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search...</span>
            </div>
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted cursor-pointer"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <BoltDialog />
            <MenuDialog />
          </div>
        </div>
      </div>

      {isDesktop ? (
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <SearchDialogContent onClose={() => setSearchOpen(false)} />
        </Dialog>
      ) : (
        <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
          <SearchDrawerContent onClose={() => setSearchOpen(false)} />
        </Drawer>
      )}
    </header>
  );
}
