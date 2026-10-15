"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faListUl,
  faListOl,
  faQuoteRight,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";

export const ENTRY_MAX = 500;

function ToolBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        buzzLight();
        onClick();
      }}
      className={`grid h-9 w-9 place-items-center rounded-full transition active:scale-95 ${
        active ? "bg-pine text-[#FFF9F0] shadow-sm" : "text-stone-500 hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const { t } = useLang();
  if (!editor) return null;
  const icon = "h-3.5 w-3.5";
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-stone-200/60 pb-2" role="toolbar" aria-label="Formatting">
      <ToolBtn title={t.journal.formatBold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <FontAwesomeIcon icon={faBold} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatItalic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <FontAwesomeIcon icon={faItalic} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatStrike} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <FontAwesomeIcon icon={faStrikethrough} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatBullet} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <FontAwesomeIcon icon={faListUl} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <FontAwesomeIcon icon={faListOl} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatQuote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <FontAwesomeIcon icon={faQuoteRight} className={icon} />
      </ToolBtn>
      <span className="mx-1 h-5 w-px bg-stone-200/70" aria-hidden />
      <ToolBtn title={t.journal.formatUndo} onClick={() => editor.chain().focus().undo().run()}>
        <FontAwesomeIcon icon={faRotateLeft} className={icon} />
      </ToolBtn>
      <ToolBtn title={t.journal.formatRedo} onClick={() => editor.chain().focus().redo().run()}>
        <FontAwesomeIcon icon={faRotateRight} className={icon} />
      </ToolBtn>
    </div>
  );
}

interface RichEditorProps {
  content: string;
  placeholder: string;
  autoFocus?: boolean;
  onChange: (html: string, text: string) => void;
  onType: () => void;
}

export function RichEditor({ content, placeholder, autoFocus, onChange, onType }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        codeBlock: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: ENTRY_MAX + 50 }),
    ],
    content,
    autofocus: autoFocus,
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap", id: "entry", "aria-label": "entry" } },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
      onType();
    },
  });

  // Apply external content changes (e.g. picking a template).
  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML() && (content !== "" || editor.getText() !== "")) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
