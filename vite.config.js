import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function getAppSource() {
  try {
    const sourcePath = resolve(__dirname, 'index.html');
    let html = readFileSync(sourcePath, 'utf-8');
    html = html
      .replace(/<!DOCTYPE html>\s*/, '')
      .replace(/\s*<script[^>]*src=".*?"><\/script>\s*$/, '')
      .trim();
    return html;
  } catch (e) {
    console.warn('Could not read source for APP_SOURCE:', e.message);
    return '';
  }
}

export default defineConfig(({ command, ssrBuild }) => {
  const appSource = getAppSource();

  return {
    build: {
      target: 'ES2020',
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    },
    server: {
      port: 3000
    },
    define: {
      APP_SOURCE: JSON.stringify(appSource)
    },
    plugins: [viteSingleFile()]
  };
});