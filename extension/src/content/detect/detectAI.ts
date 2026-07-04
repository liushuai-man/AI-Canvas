const CHATGPT_HOST = ['chat.openai.com', 'chatgpt.com'];
export function detectAI(): 'chatgpt' | null {
  if (typeof location === 'undefined') return null;
  const host = window.location.host;
  if (CHATGPT_HOST.some((h) => host.includes(h))) return 'chatgpt';
  return null;
}
