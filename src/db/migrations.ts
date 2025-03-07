import sqlite from 'sqlite';

export async function applyMigrations(db: sqlite.Database) {
    if (!db) return;
  
    const row = await db.get(`SELECT value FROM meta WHERE key = 'schema_version'`);
    const currentVersion = row ? parseInt(row.value, 10) : 0;
    
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`[DB] Applying migration v${migration.version}...`);
        try {
          await db.exec(migration.query);
          await db.run(`INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)`, migration.version);
        } catch (error) {
          console.error(`[DB] Error applying migration v${migration.version}:`, error);
        }
      }
    }  
  }

  const migrations: { version: number; query: string }[] = [
    {
      version: 1,
      query: `
        CREATE TABLE IF NOT EXISTS proficiency (
          topic TEXT PRIMARY KEY,
          accuracy REAL DEFAULT 0,
          total_questions INTEGER DEFAULT 0,
          average_time REAL DEFAULT 0,
          last_tested TEXT DEFAULT NULL
        );
      `
    },
    {
      version: 2,
      query: `
        CREATE TABLE IF NOT EXISTS quiz_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          topic TEXT,
          is_correct INTEGER,
          response_time INTEGER,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (topic) REFERENCES proficiency(topic) ON DELETE CASCADE
        );
      `
    }
    // ADD NEW MIGRATIONS HERE:
    // {
    //   version: X,   // Increment version number
    //   query: `SQL STATEMENT TO ALTER/CREATE TABLES`
    // }
  ];