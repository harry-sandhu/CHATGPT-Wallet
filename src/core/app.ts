export class FEApp {
  name: string;
  description?: string;
  handlers: Record<string, any> = {};
  constructor(opts: { name: string; description?: string }) {
    this.name = opts.name;
    this.description = opts.description;
  }
  on(action: string, handler: any) {
    this.handlers[action] = handler;
  }
  async call(action: string, ctx: any) {
    const h = this.handlers[action];
    if (!h) throw new Error(`No handler for ${action}`);
    return h(ctx);
  }
}
export function createApp(opts: { name: string; description?: string }) {
  return new FEApp(opts);
}
