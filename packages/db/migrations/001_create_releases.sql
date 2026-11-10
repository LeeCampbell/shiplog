CREATE TABLE releases (
  id         serial PRIMARY KEY,
  version    text NOT NULL UNIQUE,
  notes      text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
