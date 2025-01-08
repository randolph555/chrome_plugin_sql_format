chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("收到 background.js 的消息：", message);

  if (message.action === "fillInput") {
    const { text, target } = message;
    console.log("需要填充的文本：", text);
    console.log("目标输入框：", target);

    // 根据目标选择输入框
    const inputSelector = target === "sql" ? "#sqlInput" : "#paramsInput";
    const inputField = document.querySelector(inputSelector);
    console.log("找到的输入框：", inputField);

    if (inputField) {
      inputField.value = text; // 填充文本
      sendResponse({ success: true });
    } else {
      console.error("未找到输入框：", inputSelector);
      sendResponse({ success: false, error: "未找到输入框" });
    }
  }
});
