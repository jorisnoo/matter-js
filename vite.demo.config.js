import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    root: 'demo',
    resolve: {
        alias: {
            'matter-js': path.resolve('src/module/main.js'),
            'MatterDev': path.resolve('src/module/main.js'),
            'MatterBuild': path.resolve(
                command === 'serve' ? 'build/matter.js' : 'src/module/main.js'
            ),
        },
    },
    define: {
        __MATTER_VERSION__: JSON.stringify('*'),
        __MATTER_IS_DEV__: command === 'serve',
    },
    server: {
        port: 8000,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
}));
