// builds the npm package into dist/; vite.config.js builds the demo pages
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    lib: {
      entry: { index: 'src/shimmerling/index.js', react: 'src/shimmerling/react.jsx', vue: 'src/shimmerling/vue.js' },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'vue'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        banner: chunk => chunk.name === 'react' ? "'use client';" : '',
      },
    },
  },
});
