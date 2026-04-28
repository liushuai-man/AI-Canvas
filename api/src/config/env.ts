import dotenv from 'dotenv';

dotenv.config();

export const env = {
  notionToken: process.env.NOTION_TOKEN || '',
  port: process.env.PORT || '8080'
};
