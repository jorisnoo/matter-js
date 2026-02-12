import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.spec.js'],
        testTimeout: 2 * 60 * 1000,
        hookTimeout: 2 * 60 * 1000,
        pool: 'forks',
        reporters: ['verbose'],
    },
});
