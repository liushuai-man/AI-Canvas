export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openCanvas') {
      // 检查是否已存在画布标签页
      chrome.tabs.query(
        { url: chrome.runtime.getURL('canvas.html') },
        (tabs) => {
          if (tabs.length > 0) {
            // 激活现有标签页
            chrome.tabs.update(tabs[0].id!, { active: true });
            // 聚焦标签页所在窗口
            chrome.windows.update(tabs[0].windowId!, { focused: true });
          } else {
            // 创建新标签页
            chrome.tabs.create({
              url: chrome.runtime.getURL('canvas.html'),
            });
          }
        }
      );
    }
  });
});
