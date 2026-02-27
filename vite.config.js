import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    return {
        base: './', // GitHub Pages ve statik sunucular için relative path (göreceli yol) yapılandırması
        server: command === 'serve' ? {
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                }
            }
        } : undefined
    }
});
