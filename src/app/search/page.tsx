import { Metadata } from "next";
import SearchCSR from "./SearchCSR";

export const metadata: Metadata = {
  title: "Search",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: null,
  twitter: null,
};

export default function SearchPage() {
  return <SearchCSR />;
}
