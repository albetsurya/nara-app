"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Pip } from "@/components/pip/Pip";
import { useProfile } from "@/hooks/useJournal";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const { data: profile } = useProfile();
  const name = profile?.companion_name ?? "Pip";
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: "Hi, I am here. How was today?" }]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const send = useMutation({
    mutationFn: async (history: Msg[]) => {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(1) }) });
      if (!res.ok) throw new Error("chat failed");
      return (await res.json()).reply as string;
    },
    onSuccess: (reply) => setMessages((m) => [...m, { role: "assistant", content: reply }]),
  });

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, send.isPending]);

  const submit = () => {
    const t = text.trim();
    if (!t || send.isPending) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next);
    setText("");
    send.mutate(next);
  };

  return (
    <main className="flex min-h-[calc(100dvh-8rem)] flex-col py-1">
      <header className="flex items-center gap-3 rounded-3xl border border-stone-200/50 bg-white px-3.5 py-3 shadow-sm">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F3EDE2]"><Pip pose="wave" size={44} motion="breathe" /></span>
        <span>
          <span className="block font-display text-[15px] font-bold leading-snug text-pine">{name}</span>
          <span className="block font-sans text-xs text-stone-500">A calm buddy to talk to.</span>
        </span>
      </header>

      <ol className="flex flex-1 flex-col gap-2.5 py-4" aria-live="polite">
        {messages.map((m, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`max-w-[84%] px-4 py-2.5 font-sans text-sm font-normal leading-relaxed shadow-sm ${m.role === "user" ? "ml-auto rounded-2xl rounded-br-md bg-pine text-[#FFF9F0]" : "rounded-2xl rounded-bl-md border border-stone-200/60 bg-white text-pine"}`}>
            {m.content}
          </motion.li>
        ))}
        {send.isPending && <li className="w-14 rounded-2xl rounded-bl-md border border-stone-200/60 bg-white px-4 py-2.5 text-stone-400 shadow-sm" aria-label={`${name} is typing`}>...</li>}
        {send.isError && <li role="alert" className="text-center font-sans text-[13px] text-red-600">Could not reach {name}. Try again.</li>}
        <div ref={end} />
      </ol>

      <div className="sticky bottom-[84px] flex items-center gap-2">
        <label htmlFor="msg" className="sr-only">Message</label>
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={`Tell ${name} something...`} maxLength={1000} className="field !rounded-full !py-3 shadow-sm" />
        <button onClick={submit} disabled={!text.trim() || send.isPending} aria-label="Send" className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full bg-pine text-[#FFF9F0] shadow-md transition active:scale-95 disabled:opacity-40"><FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" /></button>
      </div>
    </main>
  );
}
