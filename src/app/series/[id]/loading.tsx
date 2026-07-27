export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-[var(--color-foreground)]">
      <div className="container mx-auto px-4 py-8">
        <article className="lg:px-24 lg:pb-16 md:pt-4 bg-[var(--color-background)]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="w-full md:w-[240px] flex-shrink-0 flex justify-center md:block">
              <div className="w-[200px] md:w-[240px] aspect-[2/3] bg-muted animate-pulse rounded-[var(--radius)]" />
            </div>
            <div className="flex-grow min-w-0 w-full flex flex-col gap-4">
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              <div className="flex gap-4 mt-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-3 mt-4">
                <div className="h-10 w-32 bg-muted animate-pulse rounded-[var(--radius)]" />
                <div className="h-10 w-40 bg-muted animate-pulse rounded-[var(--radius)]" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
