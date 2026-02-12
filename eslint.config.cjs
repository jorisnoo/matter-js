const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: ['demo/js/**', 'build/**', 'node_modules/**']
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                __MATTER_VERSION__: 'readonly',
                __MATTER_IS_DEV__: 'readonly'
            }
        },
        rules: {
            'no-fallthrough': 'error',
            'no-console': 'off',
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-redeclare': 'error',
            'indent': ['error', 4],
            'semi': ['error', 'always']
        }
    },
    {
        files: ['examples/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                Matter: 'readonly',
                MatterTools: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'off'
        }
    },
    {
        files: ['demo/src/**/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                Matter: 'readonly',
                MatterTools: 'writable',
                MatterDev: 'writable',
                MatterBuild: 'writable'
            }
        },
        rules: {
            'no-redeclare': 'off'
        }
    }
];
