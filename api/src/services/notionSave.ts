import { notion } from '../lib/notion';
import type { ContentBlock } from '../../../shared/types/block';
import { toNotionBlocks } from '../utils/toNotionBlocks';

export class NotionService {
  static async saveToNotion(pageId: string, blocks: ContentBlock[]) {
    try {
      const notionBlocks = toNotionBlocks(blocks);

      const response = await notion.blocks.children.append({
        block_id: pageId,
        children: notionBlocks,
      });

      return { success: true, data: response };
    } catch (error) {
      console.error('Error saving to Notion:', error);
      return { success: false, error: (error as Error).message };
    }
  }
  static async getNotionPages() {
    try {
      const pagesResponse = await notion.search({
        filter: {
          value: 'page',
          property: 'object',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: 50,
      });
      const databasesResponse = await notion.search({
        filter: {
          value: 'data_source',
          property: 'object',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: 50,
      });
      const allResults = [
        ...pagesResponse.results,
        ...databasesResponse.results,
      ];

      allResults.sort((a: any, b: any) => {
        const timeA = (a.last_edited_time as string) || '';
        const timeB = (b.last_edited_time as string) || '';
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      const items = allResults.map((result: any) => {
        let title = 'Untitled';
        if (result.properties?.title?.title?.[0]?.plain_text) {
          title = result.properties.title.title[0].plain_text;
        } else if (result.properties?.Name?.title?.[0]?.plain_text) {
          title = result.properties.Name.title[0].plain_text;
        }

        return {
          id: result.id,
          title,
          type: result.object,
          lastEditedTime: result.last_edited_time,
        };
      });

      return { success: true, items };
    } catch (error) {
      console.error('Error getting Notion pages:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
