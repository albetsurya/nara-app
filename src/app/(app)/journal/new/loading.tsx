export default function NewJournalLoading() {
  return (
    <main className="flex animate-pulse flex-col gap-4 py-1" aria-label="Loading editor">
      <div className="flex h-10 items-center justify-between">
        <div className="h-9 w-9 rounded-full bg-stone-200" />
        <div className="h-4 w-12 rounded-full bg-stone-100" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-52 rounded-full bg-stone-200" />
        <div className="h-4 w-36 rounded-full bg-stone-100" />
      </div>
      <div className="h-64 rounded-3xl bg-white shadow-sm" />
      <div className="h-12 w-full rounded-full bg-stone-200" />
    </main>
  );
}
