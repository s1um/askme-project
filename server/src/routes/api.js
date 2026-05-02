import { Router } from 'express';

const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ message: '안녕하세요! Express + SQLite 서버입니다.' });
});

export default router;
