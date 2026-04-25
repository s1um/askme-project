import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ message: '안녕하세요! Express + SQLite 서버입니다.' });
});

router.get('/items', (_req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY id DESC').all();
  res.json(items);
});

router.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name은 필수입니다.' });
  }
  const result = db.prepare('INSERT INTO items (name) VALUES (?)').run(name.trim());
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

router.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: '항목을 찾을 수 없습니다.' });
  res.status(204).end();
});

export default router;
