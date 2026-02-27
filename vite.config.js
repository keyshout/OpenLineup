import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // GitHub Pages ve statik sunucular için relative path (göreceli yol) yapılandırması
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            }
        }
    }
});
