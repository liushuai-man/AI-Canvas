import type { Role } from '../../../../shared/types/block';

export function normalizeChatGPTRole(role: string | null): Role {
  if (role === 'assistant') return 'assistant';
  return 'user';
}

