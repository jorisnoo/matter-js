import fs from 'fs';
import path from 'path';
import { describe, test, expect } from 'vitest';
import Matter from '../src/core/Matter.js';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const sourceFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(entryPath) : entryPath.endsWith('.js') ? [entryPath] : [];
});

describe('Package', () => {
    test('source version fallback matches package.json', () => {
        // src is consumed directly by bundlers via the "module" export condition, without the build define
        expect(Matter.version).toBe(pkg.version);
    });

    test('source relative imports are fully specified', () => {
        // webpack and Node require file extensions for ESM packages ("type": "module")
        const unspecified = sourceFiles('src').flatMap((file) => {
            const source = fs.readFileSync(file, 'utf8');
            return [...source.matchAll(/from\s+'(\.[^']*)'/g)]
                .map((match) => match[1])
                .filter((specifier) => !specifier.endsWith('.js'))
                .map((specifier) => `${file}: ${specifier}`);
        });

        expect(unspecified).toEqual([]);
    });
});
