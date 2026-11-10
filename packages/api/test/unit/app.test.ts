import { describe, expect, it } from "vitest";
import request from "supertest";
import type { NewRelease, Release } from "@shiplog/shared";
import { createApp } from "../../src/app.js";
import type { ReleaseStore } from "../../src/store.js";

function memoryStore(): ReleaseStore {
  const rows: Release[] = [];
  return {
    async list() {
      return [...rows].reverse();
    },
    async add(r: NewRelease) {
      const row = { id: rows.length + 1, ...r, createdAt: new Date().toISOString() };
      rows.push(row);
      return row;
    },
    async ping() {},
  };
}

describe("releases API", () => {
  it("creates and lists a release", async () => {
    const app = createApp(memoryStore());
    await request(app).post("/releases").send({ version: "v1.0.0", notes: "first" }).expect(201);
    const res = await request(app).get("/releases").expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].version).toBe("v1.0.0");
  });

  it("rejects a version that is not semver", async () => {
    const res = await request(createApp(memoryStore()))
      .post("/releases")
      .send({ version: "latest" })
      .expect(400);
    expect(res.body.error).toMatch(/v1\.2\.3/);
  });
});
