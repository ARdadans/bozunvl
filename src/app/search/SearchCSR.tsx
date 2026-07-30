"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Force full Client-Side Rendering (CSR) for the search page
const SearchClient = dynamic(() => import("./SearchClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function SearchCSR() {
  return <SearchClient />;
}
