import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Berkas ini ESM, jadi __dirname tidak tersedia.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Uji formulir mengetik karakter per karakter lewat userEvent; saat seluruh
    // berkas uji jalan paralel, 5 detik bawaan kadang tidak cukup.
    testTimeout: 20000,
  },
});
