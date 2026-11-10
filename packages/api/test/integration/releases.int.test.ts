import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import pg from "pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "@shiplog/db";
import { createApp } from "../../src/app.js";
import { pgStore } from "../../src/store.js";

let container: StartedPostgreSqlContainer;
let pool: pg.Pool;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:17-alpine").start();
  await migrate(container.getConnectionUri());
  pool = new pg.Pool({ connectionString: container.getConnectionUri() });
}, 120_000);

afterAll(async () => {
  await pool?.end();
  await container?.stop();
});

describe("releases API against real Postgres", () => {
  it("persists a release", async () => {
    const app = createApp(pgStore(pool));
    await request(app).post("/releases").send({ version: "v2.0.0" }).expect(201);
    const res = await request(app).get("/releases").expect(200);
    expect(res.body[0]).toMatchObject({ version: "v2.0.0", notes: "" });
  });

  it("enforces unique versions in the database", async () => {
    await expect(pgStore(pool).add({ version: "v2.0.0", notes: "" })).rejects.toThrow(/unique/i);
  });

  it("re-running migrations applies nothing", async () => {
    expect(await migrate(container.getConnectionUri())).toEqual([]);
  });
});
