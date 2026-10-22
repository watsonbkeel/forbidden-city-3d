import { defineConfig } from 'vite';
import { releaseIdentityPlugin } from './scripts/build-identity.mjs';

export default defineConfig({ plugins:[releaseIdentityPlugin()] });
