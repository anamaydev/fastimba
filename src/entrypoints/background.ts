export default defineBackground(() => {
  /* MV3 (Chrome) exposes browser.action; MV2 (Firefox) exposes browser.browserAction. */
  const action = browser.action ?? (browser as any).browserAction;

  action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    try {
      await browser.tabs.sendMessage(tab.id, {type: "TOGGLE_OVERLAY"});
    } catch {
      /* Content script not present in this tab or the tab was open before
       * the extension was installed, so the manifest's auto-injection never
       * ran. Inject it once, then retry.
       * */
      try {
        if (browser.scripting) {
          /* MV3 (Chrome) */
          await browser.scripting.executeScript({
            target: {tabId: tab.id},
            files: ["/content-scripts/content.js"],
          });
        } else {
          /* MV2 (Firefox) */
          await (browser as any).tabs.executeScript(tab.id, {
            file: "/content-scripts/content.js",
          });
        }
        await browser.tabs.sendMessage(tab.id, {type: "TOGGLE_OVERLAY"});
      } catch (err) {
        console.error("[fastimba] failed to inject content script:", err);
      }
    }
  });
});
