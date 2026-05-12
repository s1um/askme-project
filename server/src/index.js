import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import authRouter from '../routes/auth.js';
import questionsRouter from '../routes/questions.js';
import myRouter from '../routes/my.js';
import dashboardRouter from '../routes/dashboard.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: process.env.askme-kimminju.up.railway.app || 'http://localhost:5173'
}));
app.use(express.json());

app.use('/api', apiRouter);
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/my', myRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});