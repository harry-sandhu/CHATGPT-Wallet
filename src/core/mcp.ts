// src/core/mcp.ts
import { Express } from "express";
import bodyParser from "body-parser";
import { FEApp } from "./app";


export function runMCPServer(appInstance: FEApp, expressApp: Express) {
  expressApp.use(bodyParser.json());

  expressApp.post("/call", async (req, res) => {
    const action = req.query.action as string;
    try {
      const result = await appInstance.call(action, { body: req.body });
      res.json({ ok: true, result });
    } catch (err) {
      console.error("MCP action failed:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  console.log(" MCP attached to main Express server (same port)");
}
