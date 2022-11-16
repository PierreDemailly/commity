// eslint-disable-next-line spaced-comment
/// <reference types="vitest" />

import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
