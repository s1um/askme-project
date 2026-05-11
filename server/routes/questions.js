import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.post('/', (req, res) => {
  const { content, ownerId } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: '질문 내용은 1~300자여야 합니다' });
  }
  if (content.trim().length > 300) {
    return res.status(400).json({ error: '질문 내용은 1~300자여야 합니다' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(ownerId);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 사용자입니다' });
  }

  const result = db
    .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
    .run(ownerId, content.trim());

  const question = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(question);
});

router.get('/:username/answered', (req, res) => {
  const { username } = req.params;

  const user = db
    .prepare('SELECT id, username, display_name FROM users WHERE username = ?')
    .get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 사용자입니다' });
  }

  const rows = db
    .prepare(`
      SELECT
        q.id,
        q.content,
        q.created_at,
        a.content    AS answer_content,
        a.created_at AS answer_created_at
      FROM questions q
      INNER JOIN answers a ON a.question_id = q.id
      WHERE q.user_id = ?
      ORDER BY a.created_at DESC
    `)
    .all(user.id);

  const questions = rows.map(row => ({
    id: row.id,
    content: row.content,
    likes: row.likes,
    createdAt: row.created_at,
    answer: { content: row.answer_content, createdAt: row.answer_created_at },
  }));

  res.json({
    user: { id: user.id, username: user.username, displayName: user.display_name },
    questions,
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;

  const user = db
    .prepare('SELECT id, username, display_name FROM users WHERE username = ?')
    .get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 사용자입니다' });
  }

  const rows = db
    .prepare(`
      SELECT
        q.id,
        q.content,
        q.created_at,
        a.content    AS answer_content,
        a.created_at AS answer_created_at
      FROM questions q
      LEFT JOIN answers a ON a.question_id = q.id
      WHERE q.user_id = ?
      ORDER BY q.created_at DESC
    `)
    .all(user.id);

  const questions = rows.map(row => ({
    id: row.id,
    content: row.content,
    isAnswered: row.answer_content !== null,
    createdAt: row.created_at,
    answer: row.answer_content !== null
      ? { content: row.answer_content, createdAt: row.answer_created_at }
      : null,
  }));

  res.json({
    user: { id: user.id, username: user.username, displayName: user.display_name },
    questions,
  });
});

// 좋아요 추가
router.post('/:id/like', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: '잘못된 질문 ID입니다.' });
    }

    const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);
    if (!question) {
      return res.status(404).json({ success: false, error: '존재하지 않는 질문입니다.' });
    }

    db.prepare('UPDATE questions SET likes = likes + 1 WHERE id = ?').run(id);
    const { likes } = db.prepare('SELECT likes FROM questions WHERE id = ?').get(id);

    res.json({ success: true, data: { likes } });
  } catch (e) {
    res.status(500).json({ success: false, error: '좋아요 처리 중 오류가 발생했습니다.' });
  }
});

// 좋아요 취소
router.delete('/:id/like', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: '잘못된 질문 ID입니다.' });
    }

    const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);
    if (!question) {
      return res.status(404).json({ success: false, error: '존재하지 않는 질문입니다.' });
    }

    // 0 미만으로 내려가지 않도록 보호
    db.prepare('UPDATE questions SET likes = MAX(0, likes - 1) WHERE id = ?').run(id);
    const { likes } = db.prepare('SELECT likes FROM questions WHERE id = ?').get(id);

    res.json({ success: true, data: { likes } });
  } catch (e) {
    res.status(500).json({ success: false, error: '좋아요 취소 중 오류가 발생했습니다.' });
  }
});

export default router;
