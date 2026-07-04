export function getConversationId(): string {
  // 首先尝试从 URL 参数中获取对话 ID
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (idParam) {
    return idParam;
  }

  // 然后尝试从路径中获取对话 ID
  const match = location.pathname.match(/\/c\/([a-z0-9-]+)/i);
  return match?.[1] || 'temp';
}
