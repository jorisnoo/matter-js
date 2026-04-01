import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const license = readFileSync('LICENSE', 'utf8');

const kind = process.env.KIND || null;
const minify = process.env.MINIFY === 'true';
const version = !kind ? pkg.version : `${pkg.version}-${kind}+${commitHash}`;
const suffix = kind ? `.${kind}` : '';

const kindLine = kind ? `Experimental pre-release build.\n  ` : '';
const banner = `/**\n * ${pkg.name} ${version} by @liabru\n * ${kindLine}${pkg.homepage}\n * License ${pkg.license}${!minify ? '\n *\n * ' + license.replace(/\n/g, '\n * ').trimEnd() : ''}\n */\n`;

function bannerPlugin(text) {
    return {
        name: 'banner',
        generateBundle(_, bundle) {
            for (const chunk of Object.values(bundle)) {
                if (chunk.type === 'chunk') {
                    chunk.code = text + chunk.code;
                }
            }
        },
    };
}

export default defineConfig({
    build: {
        lib: {
            entry: 'src/module/main.js',
            formats: ['es'],
            fileName: () => `matter${suffix}${minify ? '.min' : ''}.js`,
        },
        outDir: 'build',
        emptyOutDir: false,
        sourcemap: true,
        minify: minify ? 'esbuild' : false,
        rollupOptions: {
            external: ['poly-decomp', 'matter-wrap'],
        },
    },
    define: {
        __MATTER_VERSION__: JSON.stringify(version),
    },
    plugins: [bannerPlugin(banner)],
});
