import { useState, useCallback } from 'react';
import type { NotionPageData } from '../../../shared/types/notion';
import { useNotionStore } from '../stores/index';
import { API_BASE_URL } from '../config/env';

interface UseNotionReturn {
  pages: NotionPageData[];
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  isLoggedIn: boolean;
  getNotionPages: (userId?: string) => Promise<NotionPageData[]>;
  handleSaveNotion: (
    pageId: string,
    blocks: any[],
    userId?: string
  ) => Promise<boolean>;
  startAuth: () => void;
  logout: (userId: string) => Promise<void>;
  checkAuthStatus: (userId: string) => Promise<boolean>;
  refreshToken: (userId: string) => Promise<boolean>;
}

export function useNotion(): UseNotionReturn {
  const [pages, setPages] = useState<NotionPageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const refreshToken = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notion/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Token refresh error:', err);
      return false;
    }
  }, []);

  const checkAndRefreshToken = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notion/user/${userId}`
        );
        const data = await response.json();

        if (data.success && data.data.isExpired) {
          return await refreshToken(userId);
        }
        return data.success && data.data.hasToken;
      } catch (err) {
        return false;
      }
    },
    [refreshToken]
  );

  const getNotionPages = useCallback(
    async (userId?: string): Promise<NotionPageData[]> => {
      setIsLoading(true);
      setError(null);

      try {
        if (userId) {
          const tokenValid = await checkAndRefreshToken(userId);
          if (!tokenValid) {
            throw new Error('Token is invalid or expired');
          }
        }

        const params = new URLSearchParams();
        if (userId) {
          params.append('userId', userId);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/notion/list?${params}`
        );
        const data = await response.json();

        if (data.success && data.pages) {
          setPages(data.pages);
          return data.pages;
        } else {
          throw new Error(data.error || 'Failed to fetch pages');
        }
      } catch (err) {
        setError((err as Error).message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [checkAndRefreshToken]
  );

  const handleSaveNotion = useCallback(
    async (
      pageId: string,
      blocks: any[],
      userId?: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (userId) {
          const tokenValid = await checkAndRefreshToken(userId);
          if (!tokenValid) {
            throw new Error('Token is invalid or expired');
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/notion/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pageId, blocks, userId }),
        });

        const data = await response.json();

        if (data.success) {
          return true;
        } else {
          throw new Error(data.error || 'Failed to save to Notion');
        }
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAndRefreshToken]
  );

  const startAuth = useCallback(() => {
    const { setUserId: storeSetUserId } = useNotionStore.getState();

    const authWindow = window.open(
      `${API_BASE_URL}/api/notion/auth`,
      '_blank',
      'width=600,height=600'
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'NOTION_AUTH_SUCCESS') {
        const userId = event.data.userId;
        setUserId(userId);
        storeSetUserId(userId);
        authWindow?.close();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  }, []);

  const logout = useCallback(async (userId: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/notion/user/${userId}`, {
        method: 'DELETE',
      });
      setUserId(null);
      setPages([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const checkAuthStatus = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notion/user/${userId}`
        );
        const data = await response.json();

        if (data.success && data.data.hasToken) {
          if (data.data.isExpired) {
            const refreshed = await refreshToken(userId);
            if (refreshed) {
              setUserId(userId);
              return true;
            }
            return false;
          }
          setUserId(userId);
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    [refreshToken]
  );

  return {
    pages,
    isLoading,
    error,
    userId,
    isLoggedIn: !!userId,
    getNotionPages,
    handleSaveNotion,
    startAuth,
    logout,
    checkAuthStatus,
    refreshToken,
  };
}
