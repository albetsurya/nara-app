export default function StampsLoading() {
  return (
    <main className="flex animate-pulse flex-col gap-4 py-1" aria-label="Loading stamps">
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-36 rounded-full bg-stone-200" />
        <div className="h-4 w-48 rounded-full bg-stone-100" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center rounded-3xl bg-white p-4 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-stone-100" />
            <div className="mt-2 h-4 w-20 rounded-full bg-stone-200" />
            <div className="mt-1 h-3 w-24 rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
