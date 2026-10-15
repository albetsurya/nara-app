"use client";

import { useLang } from "@/lib/i18n";

export interface EntryTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  structure: string; // Template with placeholders
  placeholder: string;
}

export const ENTRY_TEMPLATES: EntryTemplate[] = [
  {
    id: "free",
    nameKey: "templates.free.name",
    descriptionKey: "templates.free.desc",
    icon: "✍️",
    structure: "",
    placeholder: "Write freely...",
  },
  {
    id: "gratitude",
    nameKey: "templates.gratitude.name",
    descriptionKey: "templates.gratitude.desc",
    icon: "🌿",
    structure: `Things I'm grateful for today:
1. 
2. 
3. 

Why they matter:
`,
    placeholder: "Start with gratitude...",
  },
  {
    id: "reflection",
    nameKey: "templates.reflection.name",
    descriptionKey: "templates.reflection.desc",
    icon: "🪞",
    structure: `What happened today:

How I felt:

What I learned:

Tomorrow I want to:
`,
    placeholder: "Reflect on your day...",
  },
  {
    id: "planning",
    nameKey: "templates.planning.name",
    descriptionKey: "templates.planning.desc",
    icon: "🗓️",
    structure: `Top 3 priorities for tomorrow:
1. 
2. 
3. 

Potential obstacles:
How I'll handle them:

One thing to look forward to:
`,
    placeholder: "Plan with intention...",
  },
  {
    id: "emotions",
    nameKey: "templates.emotions.name",
    descriptionKey: "templates.emotions.desc",
    icon: "💭",
    structure: `Right now I'm feeling:

What triggered this:

What I need right now:

A kind note to myself:
`,
    placeholder: "Explore your emotions...",
  },
  {
    id: "wins",
    nameKey: "templates.wins.name",
    descriptionKey: "templates.wins.desc",
    icon: "✨",
    structure: `Today's wins (big or small):
1. 
2. 
3. 

Why they matter:

How to build on this:
`,
    placeholder: "Celebrate your progress...",
  },
];

export function getTemplate(id: string): EntryTemplate | undefined {
  return ENTRY_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateNames(t: ReturnType<typeof useLang>["t"]) {
  return ENTRY_TEMPLATES.map((template) => ({
    id: template.id,
    name: t[template.nameKey as keyof typeof t] ?? template.id,
    description: t[template.descriptionKey as keyof typeof t] ?? "",
    icon: template.icon,
  }));
}