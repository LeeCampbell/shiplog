import pg from "pg";
import type { NewRelease, Release } from "@shiplog/shared";

/** The only thing the HTTP layer knows about storage. Unit tests swap in a fake. */
export interface ReleaseStore {
  list(): Promise<Release[]>;
  add(release: NewRelease): Promise<Release>;
  ping(): Promise<void>;
}

interface Row {
  id: number;
  version: string;
  notes: string;
  created_at: Date;
}

const toRelease = (r: Row): Release => ({
  id: r.id,
  version: r.version,
  notes: r.notes,
  createdAt: r.created_at.toISOString(),
});

export function pgStore(pool: pg.Pool): ReleaseStore {
  return {
    async list() {
      const { rows } = await pool.query<Row>("SELECT * FROM releases ORDER BY id DESC");
      return rows.map(toRelease);
    },
    async add({ version, notes }) {
      const { rows } = await pool.query<Row>(
        "INSERT INTO releases (version, notes) VALUES ($1, $2) RETURNING *",
        [version, notes],
      );
      return toRelease(rows[0]!);
    },
    async ping() {
      await pool.query("SELECT 1");
    },
  };
}
