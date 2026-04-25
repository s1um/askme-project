import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../../data/app.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
