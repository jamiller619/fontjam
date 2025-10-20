import { randomUUID as uuid } from 'node:crypto'
import sql, { bulk } from 'sql-template-tag'
import { Logger } from '@fontjam/electron-logger'
import * as dto from '@shared/types/dto'
import { AllowNullableKeys } from '@shared/types/utils'
import { ConfigStore } from '~/config'
import { Repository, date } from '~/db'
import * as mapper from './mapper'
import { entity } from './types'

export default class FontRepository extends Repository {
  constructor(config: ConfigStore, log: Logger) {
    super(config, log, schema)
  }

  async getFamiliesByLibraryId(
    libraryId: string,
    withFonts = true,
  ): Promise<dto.FontFamily[]> {
    if (withFonts) return this.getFamiliesWithFonts(libraryId)

    const query = /* sql */ `
      SELECT * FROM family_fonts
      WHERE library_id = ?;
    `

    const results = await this.db.many<entity.FontFamily>(query, libraryId)

    return results.map(mapper.fontFamily.fromEntity)
  }

  async getFamiliesWithFonts(libraryId: string): Promise<dto.FontFamily[]> {
    const query = /* sql */ `
      SELECT
        ff.id,
        ff.created_at,
        ff.library_id,
        ff.name,
        ff.metadata,
        f.id as font_id,
        f.created_at as font_created_at,
        f.family_id as font_family_id,
        f.license as font_license,
        f.metadata as font_metadata,
        f.fvar as font_fvar,
        f.name as font_name,
        f.url as font_url,
        f.format as font_format,
        f.hash as font_hash,
        f.weight as font_weight,
        f.style as font_style,
        f.version as font_version
      FROM font_families ff
      LEFT JOIN fonts f ON f.family_id = ff.id
      WHERE ff.library_id = ?
      ORDER BY ff.name, f.name;
    `

    const families = await this.db.many<entity.FontFamilyWithFontJoin>(
      query,
      libraryId,
    )

    return mapper.fontFamilyJoin(families)
  }

  async removeFamiliesByLibraryId(libraryId: string): Promise<void> {
    const query = /* sql */ `
      DELETE FROM font_families
      WHERE library_id = ?
    `

    await this.db.run(query, libraryId)
  }

  async createFontFamily(
    data: AllowNullableKeys<dto.FontFamily, 'id' | 'createdAt'>,
  ): Promise<string> {
    const familyId = uuid()
    const query = /* sql */ `
      INSERT INTO font_families (id, library_id, name, metadata)
      VALUES (?, ?, ?, ?)
    `

    await this.db.run(
      query,
      familyId,
      data.libraryId,
      data.name,
      data.metadata ? JSON.stringify(data.metadata) : null,
    )

    return familyId
  }

  async createFonts(
    fonts: AllowNullableKeys<dto.Font, 'id' | 'createdAt'>[],
  ): Promise<void> {
    const insertQuery = sql`
    INSERT INTO fonts (
      id, family_id, name, url, format, hash,
      weight, style, version, license, metadata, fvar
    )
    VALUES ${bulk(
      fonts.map((f) => [
        uuid(),
        f.familyId,
        f.name,
        f.url,
        f.format,
        f.hash,
        f.weight,
        f.style,
        f.version,
        f.license,
        f.metadata,
        f.fvar,
      ]),
    )};
  `

    await this.db.run(insertQuery)
  }

  async createFont(
    font: AllowNullableKeys<dto.Font, 'id' | 'createdAt'>,
  ): Promise<string> {
    const id = uuid()
    const query = /* sql */ `
    INSERT INTO fonts (
      id, family_id, name, url, format, hash,
      weight, style, version, license, metadata, fvar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

    await this.db.run(
      query,
      id,
      font.familyId,
      font.name,
      font.url,
      font.format,
      font.hash,
      font.weight,
      font.style,
      font.version,
      font.license ? JSON.stringify(font.license) : null,
      JSON.stringify(font.metadata),
      font.fvar,
    )

    return id
  }

  async getFontFamilyById(id: string): Promise<dto.FontFamily | undefined> {
    const query = /* sql */ `
    SELECT
      ff.id,
      ff.created_at,
      ff.library_id,
      ff.name,
      ff.metadata,
      f.id as font_id,
      f.created_at as font_created_at,
      f.family_id as font_family_id,
      f.license as font_license,
      f.metadata as font_metadata,
      f.fvar as font_fvar,
      f.name as font_name,
      f.url as font_url,
      f.format as font_format,
      f.hash as font_hash,
      f.weight as font_weight,
      f.style as font_style,
      f.version as font_version
    FROM font_families ff
    LEFT JOIN fonts f ON f.family_id = ff.id
    WHERE ff.id = ?
  `

    const data = await this.db.many<entity.FontFamilyWithFontJoin>(query, id)

    return mapper.fontFamilyJoin(data).at(0)
  }

  async getFontById(id: string): Promise<entity.Font | undefined> {
    const query = /* sql */ `
    SELECT * FROM fonts
    WHERE id = ?
  `

    const row = await this.db.one<entity.Font>(query, id)

    return row
  }

  async getFontFamilyByHash(hash: string): Promise<dto.FontFamily | undefined> {
    const query = /* sql */ `
      SELECT
        ff.id,
        ff.created_at,
        ff.library_id,
        ff.name,
        ff.metadata,
        f.id as font_id,
        f.created_at as font_created_at,
        f.family_id as font_family_id,
        f.license as font_license,
        f.metadata as font_metadata,
        f.fvar as font_fvar,
        f.name as font_name,
        f.url as font_url,
        f.format as font_format,
        f.hash as font_hash,
        f.weight as font_weight,
        f.style as font_style,
        f.version as font_version
      FROM font_families ff
      LEFT JOIN fonts f ON f.family_id = ff.id
      WHERE f.hash = ?
    `

    const results = await this.db.many<entity.FontFamilyWithFontJoin>(
      query,
      hash,
    )

    return mapper.fontFamilyJoin(results).at(0)
  }

  async setActivation(
    fontId: string,
    deviceId: string,
    status: dto.ActivationStatus,
  ): Promise<void> {
    const query = /* sql */ `
    INSERT OR REPLACE INTO activations (id, font_id, device_id, status, activated_at)
      VALUES (?, ?, ?, ?, ?)
  `

    await this.db.run(query, uuid(), fontId, deviceId, status, date.toSQL())
  }

  async getActivations(deviceId: string): Promise<dto.Activation[]> {
    const results = await this.db.many<entity.Activation>(
      /* sql */ `
        SELECT * FROM activations
          WHERE device_id = ?
          AND status = 'active'
        ORDER BY activated_at DESC
      `,
      deviceId,
    )

    return results.map(mapper.activation.fromEntity)
  }
}

const schema = /* sql */ `
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
`
