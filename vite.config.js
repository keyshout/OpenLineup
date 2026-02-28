import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    const base = command === 'serve' ? '/' : '/OpenLineup/';
    return {
        base,
        server: command === 'serve' ? {
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                }
            }
        } : undefined,
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    simulation: resolve(__dirname, 'simulation/index.html')
                }
            }
        }
    }
});
