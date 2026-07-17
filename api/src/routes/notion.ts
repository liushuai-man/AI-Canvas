import express from 'express';
import { NotionController } from '../controllers/notion.controller';
import { OAuthController } from '../controllers/oauth.controller';

const router = express.Router();

// 健康检查端点
router.get('/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/list', NotionController.getNotionPages);
router.post('/save', NotionController.saveToNotion);

router.get('/auth', OAuthController.getAuthorizationUrl);
router.get('/callback', OAuthController.handleCallback);
router.get('/auth-success', OAuthController.authSuccess);
router.get('/user/:userId', OAuthController.getUserToken);
router.delete('/user/:userId', OAuthController.logout);
router.post('/refresh-token', OAuthController.refreshToken);

export default router;
