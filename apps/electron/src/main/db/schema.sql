/**
 * This file has been deprecated in favor of module-specific schemas.
 * It is here solely for historical reasons.
 */

CREATE TABLE IF NOT EXISTS libraries (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER
  user_id TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  visibility TEXT NOT NULL,
  source JSON NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  font_id INTEGER NOT NULL,
  library_id INTEGER NOT NULL,
  FOREIGN KEY (font_id) REFERENCES fonts (id),
  FOREIGN KEY (library_id) REFERENCES libraries (id)
);

CREATE TABLE IF NOT EXISTS fonts (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  format TEXT NOT NULL,
  hash TEXT NOT NULL,
  weight INTEGER,
  style TEXT NOT NULL,
  version TEXT,
  license TEXT,
  metadata JSON,
  fvar JSON,
  FOREIGN KEY (family_id) REFERENCES font_families (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fonts_family_id ON fonts(family_id);
CREATE INDEX IF NOT EXISTS idx_fonts_hash ON fonts(hash);
CREATE INDEX IF NOT EXISTS idx_fonts_url ON fonts(url);

CREATE TABLE IF NOT EXISTS font_families (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  library_id TEXT NOT NULL,
  name TEXT NOT NULL,
  metadata JSON,
  FOREIGN KEY (library_id) REFERENCES libraries (id) ON DELETE CASCADE,
  UNIQUE (library_id, name)
);

CREATE INDEX IF NOT EXISTS idx_font_families_name ON font_families(name);

CREATE TABLE IF NOT EXISTS activations (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  font_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  FOREIGN KEY (font_id) REFERENCES fonts (id),
  FOREIGN KEY (device_id) REFERENCES devices (id),
  UNIQUE (font_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_activations_font_id ON activations(font_id);
CREATE INDEX IF NOT EXISTS idx_activations_device_id ON activations(device_id);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS font_tags (
  font_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (font_id, tag_id),
  FOREIGN KEY (font_id) REFERENCES fonts (id),
  FOREIGN KEY (tag_id) REFERENCES tags (id)
);

CREATE TABLE IF NOT EXISTS operations (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  op_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  applied_at INTEGER,
  FOREIGN KEY (device_id) REFERENCES devices (id)
);

CREATE INDEX IF NOT EXISTS idx_operations_device_id ON operations(device_id);
CREATE INDEX IF NOT EXISTS idx_operations_created_at ON operations(created_at);
