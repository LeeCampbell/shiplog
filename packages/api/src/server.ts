import pg from "pg";
import { createApp } from "./app.js";
import { pgStore } from "./store.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 3000);

createApp(pgStore(pool)).listen(port, () => {
  console.log(`shiplog api listening on :${port}`);
});
