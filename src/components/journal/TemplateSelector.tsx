"use client";

import { useState, useEffect } from "react";
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

  const template = getTemplate(selectedId);

  useEffect(() => {
    if (initialTemplate) setSelectedId(initialTemplate);
  }, [initialTemplate]);

  // Type-safe access to translations
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
        <span className="text-2xl" role="img" aria-hidden>{template?.icon}</span>
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
            className="fixed inset-0 z-50 flex items-end pb-safe"
            onClick={() => setShowPicker(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-picker-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-h-[80vh] bg-white rounded-t-[28px] shadow-float overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-stone-200/60 bg-white/95 px-4 py-3 backdrop-blur">
                <h2 id="template-picker-title" className="font-display text-[17px] font-bold text-pine">
                  {getPickerTitle()}
                </h2>
                <button
                  onClick={() => {
                    buzzLight();
                    setShowPicker(false);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"
                  aria-label={t.common.close}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4 text-stone-600" />
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
                          ? "border-pine bg-pine-soft shadow-sm ring-2 ring-pine"
                          : "border-stone-200/70 bg-white hover:border-stone-300"
                      }`}
                    >
                      <span className="text-3xl" role="img" aria-hidden>{tmpl.icon}</span>
                      <p className="font-display text-[14px] font-bold text-pine text-center">
                        {getTemplateName(tmpl.id)}
                      </p>
                      <p className="font-sans text-[11px] text-stone-400 text-center">
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