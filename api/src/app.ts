import express from 'express';
import { env } from './config/env';
import notionRoutes from './routes/notion';

const app = express();
app.use(express.json());
app.use('/api/notion', notionRoutes);

app.listen(env.port, () => {
  console.log(`server running on http://localhost:${env.port}`);
});
