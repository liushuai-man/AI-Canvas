import { Request, Response } from 'express';
import { NotionService } from '../services/notionSave';
import { UserService } from '../services/userService';
import { NotionPageResponse } from '../types/notion';

export class NotionController {
  static async saveToNotion(req: Request, res: Response) {
    try {
      const { pageId, blocks, userId } = req.body;

      if (!pageId || !blocks) {
        return res
          .status(400)
          .json({ success: false, error: 'Missing required fields' });
      }

      let accessToken;
      if (userId) {
        const user = UserService.getUser(userId);
        if (user) {
          accessToken = user.notionAccessToken;
        }
      }

      const result = await NotionService.saveToNotion(
        pageId,
        blocks,
        accessToken
      );

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
      const { userId } = req.query;
      console.log('[getNotionPages] userId from query:', userId);

      let accessToken;
      if (userId && typeof userId === 'string') {
        const user = UserService.getUser(userId);
        console.log('[getNotionPages] user found:', !!user);
        if (user) {
          accessToken = user.notionAccessToken;
          console.log('[getNotionPages] using OAuth token:', accessToken?.substring(0, 20) + '...');
        }
      } else {
        console.log('[getNotionPages] no userId, will use env token');
      }

      const results = await NotionService.getNotionPages(accessToken);

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
