browser.runtime.onMessage.addListener((message) => {
  if (message.script) {
    try {
      eval(message.script);
    } catch (error) {
      console.error("Error executing script:", error);
    }
  }
});
