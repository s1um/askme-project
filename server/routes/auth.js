import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { username, password, displayName } = req.body;

  // 공백 전용 값도 거부하기 위해 trim() 후 검사
  if (!username?.trim() || !password?.trim() || !displayName?.trim()) {
    return res.status(400).json({ error: 'username, password, displayName은 필수입니다' });
  }

  // username은 URL 경로에 사용되므로 영문자·숫자·_·- 만 허용, 2~20자
  if (!/^[a-zA-Z0-9_-]{2,20}$/.test(username)) {
    return res.status(400).json({
      error: 'username은 영문자·숫자·_·-만 사용할 수 있으며 2~20자여야 합니다',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다' });
  }

  if (displayName.trim().length > 30) {
    return res.status(400).json({ error: '닉네임은 30자 이하여야 합니다' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '이미 사용 중인 username입니다' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = db
    .prepare('INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)')
    .run(username, displayName.trim(), passwordHash);

  const token = jwt.sign(
    { userId: result.lastInsertRowid, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: result.lastInsertRowid,
      username,
      displayName,
    },
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // password가 없으면 bcrypt.compare가 TypeError를 던지므로 먼저 차단
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'username과 password를 입력해주세요' });
  }

  const user = db
    .prepare('SELECT id, username, display_name, password_hash FROM users WHERE username = ?')
    .get(username);
  if (!user) {
    return res.status(401).json({ error: 'username 또는 password가 올바르지 않습니다' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'username 또는 password가 올바르지 않습니다' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
  });
});

export default router;
