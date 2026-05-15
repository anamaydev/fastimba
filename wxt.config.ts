import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

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
        id: "{65E99AB6-4E8F-4BC6-B293-0FE29C73A89E}",
        strict_min_version: "109.0",
        data_collection_permissions: {
          required: ["none"],
          optional: []
        }
      } as any
    }
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'monaco-editor/esm/vs/editor/editor.api': path.resolve('src/shims/monaco-editor.ts'),
        'monaco-editor/esm/vs/editor/common/commands/shiftCommand': path.resolve('src/shims/monaco-shift-command.ts'),
        'monaco-editor': path.resolve('src/shims/monaco-editor.ts'),
      }
    }
  }),
});