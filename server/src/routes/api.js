import { Router } from 'express';
import db from '../../db/index.js';

const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ message: '안녕하세요! Express + SQLite 서버입니다.' });
});

router.get('/stats', (_req, res) => {
  try {
    const { questions } = db.prepare('SELECT COUNT(*) AS questions FROM questions').get();
    const { answers } = db.prepare('SELECT COUNT(*) AS answers FROM answers').get();
    res.json({ success: true, data: { questions, answers } });
  } catch (e) {
    res.status(500).json({ success: false, error: '통계를 불러오는 중 오류가 발생했습니다.' });
  }
});

export default router;
