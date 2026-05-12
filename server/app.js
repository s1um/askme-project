// app.js
import express from 'express';
import questionsRouter from './routes/questions.js';
import authRouter from './routes/auth.js';
import myRouter from './routes/my.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use('/api/questions', questionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/my', myRouter);

// Express가 에러 핸들러로 인식하려면 반드시 인자가 4개여야 함
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: '서버 오류가 발생했습니다' });
});

// JSON 파싱
app.use(express.json());
 
// API 라우트 (먼저 등록!)
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
 
// 정적 파일 서빙 (React 빌드 결과물)
app.use(express.static(path.join(__dirname, '../client/dist')));
 
// SPA 폴백: API가 아닌 모든 요청을 index.html로 보냄
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

export default app;