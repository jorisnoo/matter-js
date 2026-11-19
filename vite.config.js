import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const license = readFileSync('LICENSE', 'utf8');

export default defineConfig(({ mode }) => {
    const kind = mode.startsWith('dev') ? 'dev' : mode.startsWith('alpha') ? 'alpha' : null;
    const minify = mode.endsWith('min');
    const version = kind ? `${pkg.version}-${kind}+${execSync('git rev-parse --short HEAD').toString().trim()}` : pkg.version;
    const suffix = kind ? `.${kind}` : '';

    const kindLine = kind ? 'Experimental pre-release build.\n * ' : '';
    const banner = `/*! ${pkg.name} ${version} by @liabru\n * ${kindLine}${pkg.homepage}\n * License ${pkg.license}${!minify ? '\n *\n * ' + license.replace(/\n/g, '\n * ').trimEnd() : ''}\n */`;

    return {
        build: {
            lib: {
                entry: 'src/module/main.js',
                formats: ['es'],
                fileName: () => `matter${suffix}${minify ? '.min' : ''}.js`,
            },
            outDir: 'build',
            emptyOutDir: false,
            sourcemap: true,
            target: 'es2022',
            minify: false,
            rolldownOptions: {
                output: { banner, minify, keepNames: true },
                external: ['poly-decomp', 'matter-wrap'],
            },
        },
        define: {
            __MATTER_VERSION__: JSON.stringify(version),
        },
    };
});
