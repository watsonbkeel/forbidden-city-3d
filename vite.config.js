import { defineConfig } from 'vite';
import { releaseIdentityPlugin } from './scripts/build-identity.mjs';

export default defineConfig({
  // 默认 /gugong/（生产站 tour.bkeel.com）；GitHub Pages 项目页用 VITE_BASE=/forbidden-city-3d/ 覆盖
  base: process.env.VITE_BASE || '/gugong/',
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
