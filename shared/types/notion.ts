export interface NotionPageResponse {
  success: boolean;
  items?: NotionPageData[];
  error?: string;
}

export interface NotionPageData {
  id: string;
  title: string;
  type: string;
  lastEditedTime: string;
}
