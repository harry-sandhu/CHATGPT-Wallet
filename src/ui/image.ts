export function createImage(opts: { src: string; caption?: string }) {
  return {
    type: "ui.image",
    src: opts.src,
    caption: opts.caption
  };
}
