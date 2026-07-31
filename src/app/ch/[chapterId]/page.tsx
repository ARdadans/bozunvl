import ChapterClient from "./ChapterClient";

export async function generateStaticParams() {
  return [{ chapterId: "index" }];
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  return (
    <ChapterClient
      id=""
      chapterId={chapterId}
    />
  );
}
