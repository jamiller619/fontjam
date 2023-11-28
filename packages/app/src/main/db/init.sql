CREATE TABLE IF NOT EXISTS libraries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt INTEGER NOT NULL,
  icon TEXT,
  isEditable INTEGER DEFAULT 1,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fonts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  familyId INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  fullName TEXT NOT NULL,
  path TEXT NOT NULL,
  postscriptName TEXT,
  style TEXT NOT NULL,
  weight INTEGER,
  FOREIGN KEY(familyId) REFERENCES families(id) ON DELETE CASCADE,
  CONSTRAINT idxFontsPath UNIQUE (path)
);

CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  libraryId INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  name TEXT NOT NULL,
  tags JSON,
  copyright TEXT,
  designer TEXT,
  license TEXT,
  popularity INTEGER,
  version INTEGER,
  FOREIGN KEY(libraryId) REFERENCES libraries(id) ON DELETE CASCADE,
  UNIQUE(libraryId, name)
);