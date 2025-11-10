export type HandlerContext = {
  params?: Record<string, any>;
  body?: any;
};
export type Handler = (ctx: HandlerContext) => Promise<any>;
