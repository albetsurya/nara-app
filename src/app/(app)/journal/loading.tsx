export default function JournalListLoading() {
  return (
    <main className="flex animate-pulse flex-col gap-4 py-1" aria-label="Loading entries">
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-44 rounded-full bg-stone-200" />
        <div className="h-4 w-24 rounded-full bg-stone-100" />
      </div>
      <div className="h-12 rounded-full bg-stone-100" />
      <div className="h-20 rounded-2xl bg-white shadow-sm" />
      <div className="h-20 rounded-2xl bg-white shadow-sm" />
      <div className="h-20 rounded-2xl bg-white shadow-sm" />
    </main>
  );
}
