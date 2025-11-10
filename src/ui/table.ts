export function createTable(opts: { headers: string[]; rows: string[][] }) {
  return {
    type: "ui.table",
    headers: opts.headers,
    rows: opts.rows
  };
}
