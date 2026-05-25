import { Client } from '@notionhq/client';
import { env } from '../config/env';
import type { NotionPageData } from '../types/notion';

export class NotionService {
  private static getClient(accessToken?: string): Client {
    const token = accessToken || env.notionToken;
    return new Client({ auth: token });
  }

  static async getNotionPages(
    accessToken?: string
  ): Promise<{ success: boolean; pages?: NotionPageData[]; error?: string }> {
    const notion = this.getClient(accessToken);

    try {
      const response = await notion.search({
        filter: {
          property: 'object',
          value: 'page',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: 100,
      });

      const pages: NotionPageData[] = response.results.map((result: any) => ({
        id: result.id,
        title: result.properties?.title?.title?.[0]?.plain_text || 'Untitled',
        type: result.object,
        lastEditedTime: result.last_edited_time,
      }));

      return { success: true, pages };
    } catch (error) {
      console.error('Error fetching Notion pages:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async saveToNotion(
    pageId: string,
    blocks: any[],
    accessToken?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const notion = this.getClient(accessToken);

    try {
      const results: any[] = [];

      for (const block of blocks) {
        const response = await notion.blocks.children.append({
          block_id: pageId,
          children: [block],
        });
        results.push(response);
      }

      return { success: true, data: results };
    } catch (error) {
      console.error('Error saving to Notion:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
