import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gugong/',
  build: {
    emptyOutDir: false,  // 不清空输出目录，避免触发安全删除
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
