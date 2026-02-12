const { execSync } = require('child_process');
const fs = require('fs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const license = fs.readFileSync('LICENSE', 'utf8');

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
        format: 'umd',
        name: 'Matter',
        exports: 'named',
        banner: makeBanner(minimize),
        globals: externals
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

module.exports = [makeConfig(false), makeConfig(true)];
