// app.js
import express from 'express';
import questionsRouter from './routes/questions.js';
import authRouter from './routes/auth.js';
import myRouter from './routes/my.js';

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

export default app;