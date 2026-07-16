import { Client } from '@notionhq/client';
import { env } from '../config/env';
import type { NotionPageData } from '../types/notion';
import type { ContentBlock } from '../types/block';
import { toNotionBlocks } from '../utils/toNotionBlocks';

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
    blocks: ContentBlock[],
    accessToken?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const notion = this.getClient(accessToken);

    try {
      const notionBlocks = toNotionBlocks(blocks);

      if (notionBlocks.length === 0) {
        return { success: true, data: [] };
      }

      // Notion API 每次最多追加 100 个 block，分批发送
      const results: any[] = [];
      const batchSize = 100;

      for (let i = 0; i < notionBlocks.length; i += batchSize) {
        const batch = notionBlocks.slice(i, i + batchSize);
        const response = await notion.blocks.children.append({
          block_id: pageId,
          children: batch,
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
