export default function ChatLoading() {
  return (
    <main className="flex animate-pulse flex-col gap-3 py-1" aria-label="Loading chat">
      <div className="flex items-center gap-3 rounded-3xl bg-white px-3.5 py-3 shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-stone-100" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded-full bg-stone-200" />
          <div className="mt-1.5 h-3 w-36 rounded-full bg-stone-100" />
        </div>
      </div>
      <div className="h-12 w-3/4 rounded-2xl bg-white shadow-sm" />
      <div className="ml-auto h-12 w-2/3 rounded-2xl bg-stone-200" />
      <div className="h-12 w-3/4 rounded-2xl bg-white shadow-sm" />
    </main>
  );
}
