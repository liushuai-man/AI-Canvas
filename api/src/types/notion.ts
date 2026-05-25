export interface NotionPageResponse {
  success: boolean;
  pages?: NotionPageData[];
  error?: string;
}

export interface NotionPageData {
  id: string;
  title: string;
  type: string;
  lastEditedTime: string;
}
