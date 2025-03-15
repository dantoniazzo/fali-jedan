import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Add any aliases you need here
      _app: path.resolve(__dirname, 'src/_app/'),
      _pages: path.resolve(__dirname, 'src/_pages/'),
    },
  },
});
