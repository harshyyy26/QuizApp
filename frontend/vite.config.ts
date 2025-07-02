import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: 'localhost', // ✅ safer for local dev than '::'
    port: 5173,
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(), // ✅ dev-only plugin
  ].filter(Boolean), // ✅ remove false values
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ use 'src' not './src'
    },
  },
}));
