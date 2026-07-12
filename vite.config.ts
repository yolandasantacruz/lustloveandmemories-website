/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import * as fs from 'fs';
import * as path from 'path';

// Helper to wrap plugins for client environment only
function clientOnly(plugin: any): any {
  if (Array.isArray(plugin)) {
    return plugin.map(p => clientOnly(p));
  }
  return {
    ...plugin,
    applyToEnvironment(environment: any) {
      return environment.name === 'client';
    }
  };
}

// Inline CSS plugin
function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    applyToEnvironment(environment: any) {
      return environment.name === 'client';
    },
    closeBundle() {
      const clientOutDir = path.resolve(process.cwd(), 'dist/client');
      console.log('closeBundle: checking clientOutDir:', clientOutDir);
      
      const htmlPath = path.join(clientOutDir, 'index.html');
      if (!fs.existsSync(htmlPath)) {
        console.log('closeBundle: index.html not found at:', htmlPath);
        return;
      }
      
      const assetsDir = path.join(clientOutDir, 'assets');
      if (!fs.existsSync(assetsDir)) {
        console.log('closeBundle: assets dir not found at:', assetsDir);
        return;
      }
      
      const files = fs.readdirSync(assetsDir);
      const cssFiles = files.filter(f => f.endsWith('.css'));
      console.log('closeBundle: detected client CSS files:', cssFiles);
      
      if (cssFiles.length === 0) {
        return;
      }
      
      let cssContent = '';
      for (const cssFile of cssFiles) {
        const filePath = path.join(assetsDir, cssFile);
        cssContent += fs.readFileSync(filePath, 'utf-8');
        // Delete the compiled CSS file from disk
        fs.unlinkSync(filePath);
      }
      
      let html = fs.readFileSync(htmlPath, 'utf-8');
      
      // Remove stylesheet links for the inlined files
      for (const cssFile of cssFiles) {
        const escapedFile = cssFile.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`<link[^>]*href=["']\\/?assets\\/${escapedFile}["'][^>]*>`, 'g');
        html = html.replace(regex, '');
      }
      
      // Inject styles
      const styleTag = `<style>${cssContent}</style>`;
      html = html.replace('</head>', `${styleTag}</head>`);
      
      fs.writeFileSync(htmlPath, html, 'utf-8');
      console.log(`Successfully inlined CSS from ${cssFiles.join(', ')} into index.html and deleted original CSS files.`);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      content: {
        highlighter: 'prismjs',
      },
      prerender: {
        routes: ['/home', '/books', '/about', '/books/lust-love-and-memories', '/books/the-longest-nights'],
      },
    }),
    tailwindcss(),
    clientOnly(inlineCssPlugin())
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
}));
