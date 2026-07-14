import { importConversation } from '../actions/import';

export function injectImportButton() {
  if (document.querySelector('#ai-canvas-import-btn')) return;
  const btn = document.createElement('ai-canvas-import-btn');
  btn.innerText = '自定义导出';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '60px',
    right: '20px',
    zIndex: '9999',
    padding: '8px 12px',
    background: '#4f46e5',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  });

  btn.onclick = async () => {
    await importConversation();
    btn.innerText = '✅ 已成功导出';

    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'openCanvas',
      });
      btn.innerText = '自定义导出';
    }, 1000);
  };
  document.body.appendChild(btn);
}
