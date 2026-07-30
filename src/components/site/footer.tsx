"use client";

import Link from "next/link";
import { BLOG } from "@/config/site";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname && pathname.includes("/ch/")) {
    return null;
  }

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:py-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {BLOG.TITLE}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
