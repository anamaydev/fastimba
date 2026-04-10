import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: "Fastimba",
    description: "Adds Vim keybindings, relative line numbers, and Emmet to Scrimba's Monaco editor.",
    action: {},
    web_accessible_resources: [
      {
        resources: ['monaco-bridge.js'],
        matches: ['*://scrimba.com/*']
      }
    ]
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
