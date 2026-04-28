import { Request, Response } from 'express';
import { NotionService } from '../services/notionSave';
import { NotionPageResponse } from '../../../shared/types/notion';

export class NotionController {
  static async saveToNotion(req: Request, res: Response) {
    try {
      const { pageId, blocks } = req.body;

      if (!pageId || !blocks) {
        return res
          .status(400)
          .json({ success: false, error: 'Missing required fields' });
      }

      const result = await NotionService.saveToNotion(pageId, blocks);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static async getNotionPages(req: Request, res: Response<NotionPageResponse>) {
    try {
      const results = await NotionService.getNotionPages();

      if (results.success) {
        res.status(200).json(results);
      } else {
        res.status(500).json(results);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}
