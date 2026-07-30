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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function SearchPage({ searchParams }: Props) {
  return <SearchCSR />;
}
