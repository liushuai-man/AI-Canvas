import express from 'express';
import { NotionController } from '../controllers/notion.controller';

const router = express.Router();
router.get('/list', NotionController.getNotionPages);
router.post('/save', NotionController.saveToNotion);
export default router;
