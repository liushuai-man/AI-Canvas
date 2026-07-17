import dotenv from 'dotenv';

dotenv.config();

export const env = {
  notionToken: process.env.NOTION_TOKEN || '',
  port: process.env.PORT || '8080',
  notionClientId: process.env.NOTION_CLIENT_ID || '',
  notionClientSecret: process.env.NOTION_CLIENT_SECRET || '',
  notionRedirectUri:
    process.env.NOTION_REDIRECT_URI ||
    'http://120.55.2.225/api/notion/callback',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-here',
};
