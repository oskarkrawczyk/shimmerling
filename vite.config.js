// serves and builds the demo pages in demo/; vite.lib.config.js builds the npm package
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'demo',
  plugins: [react(), vue()],
  server: { host: '127.0.0.1', port: 8765, strictPort: true },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
    rollupOptions: { input: { react: 'demo/index.html', vue: 'demo/vue.html', vanilla: 'demo/vanilla.html' } },
  },
});
