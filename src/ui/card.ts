// src/ui/card.ts

export function createCard(opts: {
  title: string;
  subtitle?: string;
  image?: string;
  buttons?: any[];
  blocks?: any[];         // 🔥 allows wallet rows or structured content
  footer?: string;        // 🔥 footer text (e.g., tips)
  meta?: Record<string, any>; // 🔥 metadata like txHash
}) {
  return {
    type: "ui.card",
    title: opts.title,
    subtitle: opts.subtitle,
    image: opts.image,
    buttons: opts.buttons || [],
    blocks: opts.blocks || [],
    footer: opts.footer,
    meta: opts.meta,
  };
}
