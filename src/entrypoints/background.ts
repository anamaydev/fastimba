export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if(tab.id) {
      console.log(`icon was clicked on Tab ${tab.id}`);
      try {
        /* send message to content script */
        await browser.tabs.sendMessage(tab.id, {type: "TOGGLE_OVERLAY"});
      } catch {
        /* content script not yet injected: inject it */
        await browser.scripting.executeScript({
          target: {tabId: tab.id},
          files: ["/content-scripts/content.js"],
        });
        /* retry sending message to content script */
        await browser.tabs.sendMessage(tab.id, {type: "TOGGLE_OVERLAY"});
      }
    }
  })
});
