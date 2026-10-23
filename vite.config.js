import { defineConfig } from 'vite';
import { releaseIdentityPlugin } from './scripts/build-identity.mjs';

export default defineConfig({
  base: '/gugong/',
  plugins: [releaseIdentityPlugin()],
  build: {
    emptyOutDir: false,  // 不清空输出目录，避免触发安全删除
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
