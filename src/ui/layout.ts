export function createLayout(opts: { columns: number; children: any[] }) {
  return {
    type: "ui.layout",
    columns: opts.columns,
    children: opts.children
  };
}
