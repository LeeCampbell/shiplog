import express from "express";
import { parseNewRelease } from "@shiplog/shared";
import type { ReleaseStore } from "./store.js";

export function createApp(store: ReleaseStore) {
  const app = express();
  app.use(express.json());

  app.get("/health", async (_req, res) => {
    await store.ping();
    res.json({ status: "ok", version: process.env.APP_VERSION ?? "dev" });
  });

  app.get("/releases", async (_req, res) => {
    res.json(await store.list());
  });

  app.post("/releases", async (req, res) => {
    const input = parseNewRelease(req.body);
    if (typeof input === "string") {
      res.status(400).json({ error: input });
      return;
    }
    res.status(201).json(await store.add(input));
  });

  return app;
}
