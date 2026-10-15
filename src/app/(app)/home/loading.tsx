export default function HomeLoading() {
  return (
    <main className="flex animate-pulse flex-col gap-4 pt-1" aria-label="Loading home">
      <div className="flex h-10 items-center justify-between">
        <div className="h-6 w-16 rounded-full bg-stone-200" />
        <div className="h-7 w-20 rounded-full bg-stone-200" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-48 rounded-full bg-stone-200" />
        <div className="h-4 w-40 rounded-full bg-stone-100" />
      </div>
      <div className="flex flex-col items-center rounded-3xl border border-stone-200/50 bg-white px-4 py-5">
        <div className="h-44 w-44 rounded-full bg-stone-100" />
        <div className="mt-2 h-6 w-24 rounded-full bg-stone-200" />
        <div className="mt-3 h-12 w-full rounded-full bg-stone-100" />
      </div>
      <div className="h-20 rounded-2xl bg-white shadow-sm" />
      <div className="h-20 rounded-2xl bg-white shadow-sm" />
    </main>
  );
}
