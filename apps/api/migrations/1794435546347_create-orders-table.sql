-- Up Migration
CREATE TABLE orders (
  id             serial PRIMARY KEY,
  email          text        NOT NULL,
  total_in_cents integer     NOT NULL CHECK (total_in_cents >= 0),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_email_idx ON orders (email);

-- Down Migration
DROP TABLE orders;