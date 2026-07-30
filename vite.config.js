import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const appDirectory = fs.realpathSync(process.cwd());

export default defineConfig(() => {
  return {
    root: 'metadata-app',
    build: {
      outDir: path.resolve(appDirectory, 'ckanext/dcat_usmetadata/public'),
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: 'assets/[name].js',
        },
      },
    },
    resolve: {
      alias: [
        {
          find: '@uswds',
          replacement: 'node_modules/@uswds',
        },
      ],
    },
    plugins: [react(), svgr()],
  };
});
