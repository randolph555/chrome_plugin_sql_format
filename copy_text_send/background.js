// 创建右键菜单
chrome.contextMenus.create({
  id: "sendToSql",
  title: "发送到 SQL 框",
  contexts: ["selection"] // 仅在选中文本时显示
});

chrome.contextMenus.create({
  id: "sendToParam",
  title: "发送到 参数框",
  contexts: ["selection"] // 仅在选中文本时显示
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  console.log("选中文本：", selectedText);

  if (info.menuItemId === "sendToSql" || info.menuItemId === "sendToParam") {
    // 获取当前活动的 sql_format 页面
    chrome.tabs.query({ url: "*://sql.pprompt.cn/sql_format" }, (tabs) => {
      console.log("找到的 sql_format 页面：", tabs);

      if (tabs.length > 0) {
        const sqlFormatTab = tabs[0];
        const target = info.menuItemId === "sendToSql" ? "sql" : "param";
        console.log("目标输入框：", target);

        // 动态注入 content.js
        chrome.scripting.executeScript({
          target: { tabId: sqlFormatTab.id },
          files: ["content.js"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("注入 content.js 失败：", chrome.runtime.lastError);
          } else {
            console.log("content.js 注入成功");

            // 发送消息到 content.js
            chrome.tabs.sendMessage(sqlFormatTab.id, {
              action: "fillInput",
              text: selectedText,
              target: target
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("发送消息失败：", chrome.runtime.lastError);
              } else if (response) {
                console.log("content.js 的响应：", response);
                if (response.success) {
                  // 显示通知
                  chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png", // 确保图标文件存在
                    title: "发送成功",
                    message: `已发送到 ${target === "sql" ? "SQL 框" : "参数框"}`
                  });
                } else {
                  console.error("发送失败：", response.error);
                }
              } else {
                console.error("未收到 content.js 的响应");
              }
            });
          }
        });
      } else {
        console.error("未找到 sql_format 页面");
      }
    });
  }
});
