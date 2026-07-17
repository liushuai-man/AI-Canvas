import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import notionRoutes from './routes/notion';

const app = express();

// CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api/notion', notionRoutes);

app.listen(env.port, () => {
  console.log(`server running on http://0.0.0.0:${env.port}`);
});
