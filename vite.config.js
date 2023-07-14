import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const appDirectory = fs.realpathSync(process.cwd());

export default defineConfig(() => {
  return {
    root: 'metadata-app',
    build: {
      outDir: path.resolve(appDirectory, 'ckanext/dcat_usmetadata/public'),
    },
    plugins: [react()],
  };
});
