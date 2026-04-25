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

// 질문 목록 조회
router.get('/questions', (_req, res) => {
  const questions = db.prepare('SELECT * FROM questions ORDER BY id DESC').all();
  res.json(questions);
});

// 질문 단건 조회
router.get('/questions/:id', (req, res) => {
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
  if (!question) return res.status(404).json({ error: '질문을 찾을 수 없습니다.' });
  res.json(question);
});

// 질문 등록
router.post('/questions', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title은 필수입니다.' });
  }
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content는 필수입니다.' });
  }
  const result = db
    .prepare('INSERT INTO questions (title, content, author) VALUES (?, ?, ?)')
    .run(title.trim(), content.trim(), (author ?? '익명').toString().trim() || '익명');
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(question);
});

// 질문 삭제
router.delete('/questions/:id', (req, res) => {
  const result = db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: '질문을 찾을 수 없습니다.' });
  res.status(204).end();
});

export default router;
