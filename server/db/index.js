import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new Database(join(__dirname, '../../data/app.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// 컬럼 단위 마이그레이션: PRAGMA로 존재 여부 확인 후 추가
const questionsCols = db.pragma('table_info(questions)').map(c => c.name);
if (!questionsCols.includes('likes')) {
  db.exec('ALTER TABLE questions ADD COLUMN likes INTEGER NOT NULL DEFAULT 0');
}

export default db;
