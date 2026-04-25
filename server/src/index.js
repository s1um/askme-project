import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
