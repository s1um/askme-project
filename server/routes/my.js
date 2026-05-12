import { Router } from 'express';
import db from '../db/index.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', (req, res) => {
  const { userId } = req.user;
  const user = db
    .prepare('SELECT id, username, display_name FROM users WHERE id = ?')
    .get(userId);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
  res.json({ id: user.id, username: user.username, displayName: user.display_name });
});

router.get('/questions', (req, res) => {
  const { userId } = req.user;

  const rows = db.prepare(`
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
  `).all(userId);

  const questions = rows.map(row => ({
    id: row.id,
    content: row.content,
    isAnswered: row.answer_content !== null,
    createdAt: row.created_at,
    answer: row.answer_content !== null
      ? { content: row.answer_content, createdAt: row.answer_created_at }
      : null,
  }));

  res.json(questions);
});

router.post('/questions/:id/answer', (req, res) => {
  const { userId } = req.user;
  const questionId = Number(req.params.id);
  const { content } = req.body;

  if (!Number.isInteger(questionId) || questionId < 1) {
    return res.status(400).json({ error: '잘못된 질문 ID입니다' });
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: '답변 내용을 입력해주세요' });
  }

  if (content.trim().length > 1000) {
    return res.status(400).json({ error: '답변 내용은 1000자 이하여야 합니다' });
  }

  try {
    const question = db.prepare('SELECT id, user_id FROM questions WHERE id = ?').get(questionId);
    if (!question) {
      return res.status(404).json({ error: '존재하지 않는 질문입니다' });
    }
    if (question.user_id !== userId) {
      return res.status(403).json({ error: '내 질문함의 질문만 답변할 수 있습니다' });
    }

    const existing = db.prepare('SELECT id FROM answers WHERE question_id = ?').get(questionId);
    if (existing) {
      return res.status(409).json({ error: '이미 답변된 질문입니다' });
    }

    const answer = db.transaction(() => {
      const result = db
        .prepare('INSERT INTO answers (question_id, content) VALUES (?, ?)')
        .run(questionId, content.trim());

      db.prepare("UPDATE questions SET answered_at = datetime('now') WHERE id = ?")
        .run(questionId);

      return db
        .prepare('SELECT id, content, created_at AS createdAt FROM answers WHERE id = ?')
        .get(result.lastInsertRowid);
    })();

    res.status(201).json(answer);
  } catch {
    res.status(500).json({ error: '답변 처리 중 오류가 발생했습니다' });
  }
});

router.delete('/questions/:id', (req, res) => {
  const { userId } = req.user;
  const questionId = Number(req.params.id);

  if (!Number.isInteger(questionId) || questionId < 1) {
    return res.status(400).json({ error: '잘못된 질문 ID입니다' });
  }

  try {
    const question = db.prepare('SELECT id, user_id FROM questions WHERE id = ?').get(questionId);
    if (!question) {
      return res.status(404).json({ error: '존재하지 않는 질문입니다' });
    }
    if (question.user_id !== userId) {
      return res.status(403).json({ error: '내 질문함의 질문만 삭제할 수 있습니다' });
    }

    db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: '삭제 처리 중 오류가 발생했습니다' });
  }
});

export default router;
