import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const license = readFileSync('LICENSE', 'utf8');

const kind = process.env.KIND || null;
const version = !kind ? pkg.version : `${pkg.version}-${kind}+${commitHash}`;

const makeBanner = (minimize) => {
    const kindLine = kind ? `Experimental pre-release build.\n  ` : '';
    return `/**\n * ${pkg.name} ${version} by @liabru\n * ${kindLine}${pkg.homepage}\n * License ${pkg.license}${!minimize ? '\n *\n * ' + license.replace(/\n/g, '\n * ').trimEnd() : ''}\n */`;
};

const externals = {
    'poly-decomp': 'decomp',
    'matter-wrap': 'MatterWrap'
};

const suffix = kind ? `.${kind}` : '';

const makeConfig = (minimize) => ({
    input: 'src/module/main.js',
    output: {
        file: `build/matter${suffix}${minimize ? '.min' : ''}.js`,
        format: 'es',
        exports: 'named',
        banner: makeBanner(minimize),
        sourcemap: true,
    },
    external: Object.keys(externals),
    plugins: [
        nodeResolve(),
        replace({
            preventAssignment: true,
            values: {
                __MATTER_VERSION__: JSON.stringify(version)
            }
        }),
        minimize && terser({
            output: {
                comments: /^!/
            }
        })
    ].filter(Boolean)
});

export default [makeConfig(false), makeConfig(true)];
