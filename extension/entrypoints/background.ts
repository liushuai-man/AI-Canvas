export default defineBackground(() => {
  // 监听扩展图标点击事件，打开弹窗窗口
  chrome.action.onClicked.addListener(async (tab) => {
    // 检查是否已经打开了弹窗窗口
    const windows = await chrome.windows.getAll({ populate: true });
    const existingWindow = windows.find((w) =>
      w.tabs?.some((t) => t.url?.includes('popup.html'))
    );

    if (existingWindow) {
      // 如果已经打开，聚焦该窗口
      await chrome.windows.update(existingWindow.id!, { focused: true });
    } else {
      // 打开新的弹窗窗口
      await chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 380,
        height: 600,
        focused: true,
      });
    }
  });

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
