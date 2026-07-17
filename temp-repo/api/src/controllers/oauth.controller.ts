import { Request, Response } from 'express';
import { env } from '../config/env';
import { UserService } from '../services/userService';
import axios from 'axios';

export class OAuthController {
  static async getAuthorizationUrl(req: Request, res: Response) {
    try {
      const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${env.notionClientId}&redirect_uri=${encodeURIComponent(env.notionRedirectUri)}&response_type=code&owner=user&scope=pages:read%20pages:write`;
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error generating authorization URL:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate authorization URL',
      });
    }
  }

  static async handleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res
          .status(400)
          .json({ success: false, error: 'Missing authorization code' });
      }

      console.log('OAuth callback received with code:', code.substring(0, 10) + '...');
      console.log('Using client_id:', env.notionClientId);
      console.log('Using redirect_uri:', env.notionRedirectUri);

      // 使用 Basic Auth 格式（Notion 要求）
      const credentials = Buffer.from(
        `${env.notionClientId}:${env.notionClientSecret}`
      ).toString('base64');

      const tokenResponse = await axios.post(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: env.notionRedirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in, owner } =
        tokenResponse.data;

      if (!access_token) {
        return res
          .status(400)
          .json({ success: false, error: 'Failed to get access token' });
      }

      const userId = owner?.user?.id || `user_${Date.now()}`;

      console.log('OAuth token exchange successful');
      console.log('User ID:', userId);
      console.log('Access token (first 20 chars):', access_token.substring(0, 20) + '...');
      console.log('Has refresh token:', !!refresh_token);
      console.log('Expires in:', expires_in, 'seconds');

      const expiresAt = expires_in
        ? Date.now() + expires_in * 1000
        : undefined;

      UserService.createUser(
        userId,
        access_token,
        refresh_token,
        expiresAt
      );

      res.redirect(
        `http://localhost:8080/api/notion/auth-success?userId=${userId}`
      );
    } catch (error: any) {
      console.error('OAuth callback error:', error.message);
      if (error.response) {
        console.error('Notion API response:', error.response.data);
      }
      res
        .status(500)
        .json({ success: false, error: 'Failed to exchange token' });
    }
  }

  static async authSuccess(req: Request, res: Response) {
    const userId = req.query.userId as string | undefined;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Notion 授权成功</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            text-align: center; 
            padding: 40px; 
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .success { 
            color: #10b981; 
            font-size: 24px; 
            margin-bottom: 16px; 
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .success svg {
            width: 24px;
            height: 24px;
          }
          .info { 
            color: #6b7280; 
            margin-bottom: 24px; 
            font-size: 14px;
          }
          .btn { 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 8px; 
            text-decoration: none; 
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .btn:hover { 
            background: #2563eb; 
          }
        </style>
      </head>
      <body>
        <div class="success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Notion 授权成功
        </div>
        <div class="info">您已成功授权 AI Canvas 访问您的 Notion 账户</div>
        <div class="info">用户 ID: ${userId}</div>
        <br>
        <a href="#" class="btn" onclick="window.close()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          关闭窗口
        </a>
        <script>
          (function() {
            window.opener?.postMessage({ type: 'NOTION_AUTH_SUCCESS', userId: '${userId}' }, '*');
          })();
        </script>
      </body>
      </html>
    `);
  }

  static async getUserToken(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: 'User ID is required' });
      }

      const user = UserService.getUser(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: 'User not found' });
      }

      const isExpired = user.expiresAt && Date.now() > user.expiresAt;

      res.json({
        success: true,
        data: {
          userId: user.id,
          hasToken: !!user.notionAccessToken,
          isExpired,
        },
      });
    } catch (error) {
      console.error('Error getting user token:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: 'User ID is required' });
      }

      const deleted = UserService.deleteUser(userId);

      if (deleted) {
        res.json({ success: true, message: 'Logged out successfully' });
      } else {
        res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const userId = req.body.userId as string;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: 'User ID is required' });
      }

      const user = UserService.getUser(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: 'User not found' });
      }

      if (!user.notionRefreshToken) {
        return res
          .status(400)
          .json({ success: false, error: 'No refresh token available' });
      }

      const tokenResponse = await axios.post(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'refresh_token',
          refresh_token: user.notionRefreshToken,
          client_id: env.notionClientId,
          client_secret: env.notionClientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      const expiresAt = expires_in
        ? Date.now() + expires_in * 1000
        : undefined;

      UserService.updateUserToken(
        userId,
        access_token,
        refresh_token,
        expiresAt
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to refresh token' });
    }
  }
}
