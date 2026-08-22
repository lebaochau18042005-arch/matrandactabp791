import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          const motionPackages = [
            '/node_modules/motion/',
            '/node_modules/framer-motion/',
            '/node_modules/motion-dom/',
            '/node_modules/motion-utils/'
          ];
          if (motionPackages.some(packagePath => normalizedId.includes(packagePath))) {
            return 'motion';
          }

          if (normalizedId.endsWith('/src/data/assessmentCurriculum.ts')) {
            return 'assessment-curriculum';
          }

          if (normalizedId.includes('/node_modules/mammoth/')) {
            return 'mammoth';
          }

          const documentReaderPackages = [
            '/node_modules/@xmldom/',
            '/node_modules/argparse/',
            '/node_modules/base64-js/',
            '/node_modules/bluebird/',
            '/node_modules/dingbat-to-unicode/',
            '/node_modules/jszip/',
            '/node_modules/lop/',
            '/node_modules/path-is-absolute/',
            '/node_modules/underscore/',
            '/node_modules/xmlbuilder/'
          ];
          if (documentReaderPackages.some(packagePath => normalizedId.includes(packagePath))) {
            return 'document-reader-deps';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
});
