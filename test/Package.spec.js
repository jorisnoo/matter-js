import fs from 'fs';
import path from 'path';
import { SourceMap } from 'node:module';
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

    test('the bundled source map locates Common.extend after the license banner', () => {
        const code = fs.readFileSync('build/matter.js', 'utf8').split('\n');
        const map = new SourceMap(JSON.parse(fs.readFileSync('build/matter.js.map', 'utf8')));
        const line = code.findIndex((text) => text.includes('static extend('));
        expect(line).toBeGreaterThan(0);
        const entry = map.findEntry(line, code[line].indexOf('extend'));
        expect(entry.originalSource).toMatch(/src\/core\/Common\.js$/);
        const source = fs.readFileSync('src/core/Common.js', 'utf8').split('\n');
        expect(source[entry.originalLine]).toContain('static extend(');
    });

    test('the compact bundle removes formatting without losing its license', () => {
        const code = fs.readFileSync('build/matter.min.js', 'utf8');
        expect(code).toContain('License MIT');
        expect(code.split('\n').length).toBeLessThan(100);
        expect(Buffer.byteLength(code)).toBeLessThan(100_000);
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
