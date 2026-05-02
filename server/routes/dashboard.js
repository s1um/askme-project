import { Router } from 'express';
import db from '../db/index.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

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

export default router;
