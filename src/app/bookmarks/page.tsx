import BookmarksClient from "./BookmarksClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your bookmarked series.",
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
