import { cpSync } from 'node:fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    optimizeDeps: {
        // A second copy inside prebundled matter-tools would have different class prototypes.
        exclude: ['matter-js'],
    },
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
        rolldownOptions: {
            output: { keepNames: true }, // Resurrect's namespace resolver uses constructor.name.
        },
    },
    plugins: [{
        name: 'demo-example-assets',
        writeBundle({ dir }) {
            // The examples request these public URLs at runtime rather than importing them.
            for (const folder of ['img', 'svg']) {
                cpSync(path.resolve('demo', folder), path.join(dir, folder), { recursive: true });
            }
        },
    }],
}));
