"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/lib/i18n";
import { ENTRY_TEMPLATES, getTemplate, EntryTemplate } from "@/lib/templates";
import { buzzLight } from "@/lib/haptics";

interface TemplateSelectorProps {
  onSelect: (template: EntryTemplate) => void;
  initialTemplate?: string;
}

export function TemplateSelector({ onSelect, initialTemplate = "free" }: TemplateSelectorProps) {
  const { t } = useLang();
  const [selectedId, setSelectedId] = useState(initialTemplate);
  const [showPicker, setShowPicker] = useState(false);

  // Use useMemo to ensure template values react to language changes
  const template = useMemo(() => getTemplate(selectedId), [selectedId]);
  
  // Translation helpers that re-run when `t` changes
  const getTemplateName = (id: string) => t.templates?.[id as keyof typeof t.templates]?.name ?? id;
  const getTemplateDesc = (id: string) => t.templates?.[id as keyof typeof t.templates]?.desc ?? "";
  const getPickerTitle = () => t.journal?.templatePicker ?? "Choose a template";

  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          buzzLight();
          setShowPicker(true);
        }}
        className="w-full flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white px-4 py-3 shadow-sm transition hover:border-stone-300"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F4EFE6] dark:bg-slate-800 p-1">
          {template && <template.Icon size={34} />}
        </span>
        <div className="flex-1 text-left">
          <p className="font-display text-[15px] font-bold text-pine">
            {getTemplateName(selectedId)}
          </p>
          <p className="font-sans text-[12px] text-stone-400">
            {getTemplateDesc(selectedId)}
          </p>
        </div>
        <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5 text-stone-300" />
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-picker-title"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-md max-h-[80vh] bg-white dark:bg-[#1E293B] rounded-t-[28px] shadow-float overflow-hidden flex flex-col border-t border-stone-200/60 dark:border-slate-700/60 pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/60 bg-white/95 px-4 py-3.5 backdrop-blur dark:bg-[#1E293B]/95 dark:border-slate-700/60">
                <h2 id="template-picker-title" className="font-display text-[17px] font-bold text-pine dark:text-slate-100">
                  {getPickerTitle()}
                </h2>
                <button
                  onClick={() => {
                    buzzLight();
                    setShowPicker(false);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm transition active:scale-95"
                  aria-label={t.common.close}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4 text-stone-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {ENTRY_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        buzzLight();
                        setSelectedId(tmpl.id);
                        onSelect(tmpl);
                        setShowPicker(false);
                      }}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                        selectedId === tmpl.id
                          ? "border-pine bg-pine-soft shadow-sm ring-2 ring-pine dark:bg-slate-800/80 dark:border-pine dark:ring-pine"
                          : "border-stone-200/70 bg-white hover:border-stone-300 dark:bg-slate-800/40 dark:border-slate-700/60"
                      }`}
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F4EFE6] dark:bg-slate-800 p-1.5 mb-1">
                        <tmpl.Icon size={40} />
                      </span>
                      <p className="font-display text-[14px] font-bold text-pine dark:text-slate-100 text-center">
                        {getTemplateName(tmpl.id)}
                      </p>
                      <p className="font-sans text-[11px] text-stone-400 dark:text-slate-400 text-center">
                        {getTemplateDesc(tmpl.id)}
                      </p>
                      {selectedId === tmpl.id && (
                        <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-pine text-[#FFF9F0] text-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}