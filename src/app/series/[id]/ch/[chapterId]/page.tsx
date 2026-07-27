import ChapterClient from "./ChapterClient";

export default async function ChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  
  return (
    <ChapterClient 
      id={id} 
      chapterId={chapterId} 
    />
  );
}
