import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: 'src',
  manifest: {
    name: "Fastimba",
    description: "Adds Vim keybindings, relative line numbers, and Emmet to Scrimba's Monaco editor.",
    action: {},
    web_accessible_resources: [
      {
        resources: ["monaco-bridge.js", "pomodoro-bridge.js", "audio/chime.ogg"],
        matches: ["*://scrimba.com/*"]
      }
    ],
    browser_specific_settings: {
      gecko: {
        id: "{FFAD77AC-31BA-4422-B5D0-8F5D61A92E91}",
        strict_min_version: "109.0",
        data_collection_permissions: {
          required: [],
          optional: []
        }
      } as any
    }
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
