"use client";

import Link from "next/link";
import { Search, Bolt, Menu, X, Bookmark } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BLOG } from "@/config/site";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { idbGet } from "@/lib/wp";


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
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <h3 className="font-heading text-lg font-semibold">Coming Soon Feature</h3>
            <p className="text-sm text-muted-foreground">
              Fitur ini sedang dalam pengembangan dan akan segera hadir.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MenuDialog() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button title="Menu" className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col py-2 mt-4 space-y-1">
          <h3 className="font-heading text-base font-semibold mb-2 px-2">Menu</h3>
          <SheetClose asChild>
            <Link href="/bookmarks" className="flex items-center gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors w-full text-left">
              <Bookmark className="h-5 w-5" />
              <span className="text-base">Bookmarks</span>
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleOpenSearch = useCallback(() => {
    setInputValue("");
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      idbGet<string[]>("recent_searches").then((res) => {
        if (res && Array.isArray(res)) {
          setRecentSearches(res as string[]);
        }
      });
    }
  }, [searchOpen]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleSearch(inputValue);
    }
  };

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
  if (pathname && (pathname === "/ch" || pathname.startsWith("/ch/"))) {
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
            onClick={handleOpenSearch}
            className="flex h-9 w-sm items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 text-foreground/80 transition-colors hover:bg-muted cursor-pointer md:text-base"
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
              onClick={handleOpenSearch}
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

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search series by title..."
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
        />
        <CommandList>
          <CommandEmpty>
            {inputValue ? (
              <div
                className="cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-2"
                onClick={() => handleSearch(inputValue)}
              >
                <Search className="h-4 w-4" />
                <span>Tekan <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Enter</kbd> untuk mencari &quot;{inputValue}&quot;</span>
              </div>
            ) : (
              "Belum ada pencarian."
            )}
          </CommandEmpty>
          {recentSearches.length > 0 && (
            <CommandGroup heading="Terakhir dicari">
              {recentSearches.map((term, i) => (
                <CommandItem className={cn(
                  "data-[selected=true]:bg-transparent",
                  "data-[selected=true]:text-white", "hover:!bg-accent",
                  "last:mb-2",
                  className
                )} key={i} onSelect={() => handleSearch(term)}>
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  {term}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
