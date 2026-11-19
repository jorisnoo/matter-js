import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';
import Matter, { Bodies, Body, Common, Constraint } from '../src/module/index.js';

test('module export condition resolves the source classes and assembled namespace', () => {
    execFileSync(process.execPath, ['--conditions=module', '--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import Matter, { Body } from 'matter-js';
        import SourceBody from './src/body/Body.js';
        assert.equal(Body, SourceBody);
        assert.equal(Matter.Body, Body);
        assert.ok(Matter.Bodies.rectangle(0, 0, 20, 20) instanceof Body);
    `], { cwd: new URL('../', import.meta.url) });
});

test('an object plugin installs once and can hook the named Body factory', () => {
    const create = Body.create;
    const { uses, used } = Matter;
    const calls = [];
    const plugin = {
        name: 'test-body-hooks', version: '1.0.0',
        install(module) {
            expect(module).toBe(Matter);
            calls.push('install');
            module.before('Body.create', options => {
                calls.push('before');
                options.label = 'hooked';
            });
            module.after('Body.create', function() {
                calls.push(this.label);
                this.plugin.seen = true;
            });
        }
    };
    try {
        Matter.used = [...used];
        Matter.use(plugin);
        Matter.use(plugin.name);
        const body = Body.create({});
        expect(calls).toEqual(['install', 'before', 'hooked']);
        expect(body).toBeInstanceOf(Body);
        expect(body.plugin.seen).toBe(true);
    } finally {
        Body.create = create;
        Matter.uses = uses;
        Matter.used = used;
        delete Matter.Plugin._registry[plugin.name];
    }
});

test('deep merge copies own fields without modifying inherited defaults', () => {
    const defaults = { render: { visible: true } };
    const options = Object.create({ label: 'inherited' });
    options.render = { opacity: 0.5 };
    const result = Common.extend(Object.create(defaults), options);
    expect(Object.keys(result)).toEqual(['render']);
    expect(result.render).toEqual({ opacity: 0.5 });
    expect(result.render).not.toBe(options.render);
    expect(defaults.render).toEqual({ visible: true });
});

test.each(['constructor', 'prototype', '__proto__'])('reserved field %s is not an option or path', key => {
    const record = Object.create(null);
    record[key] = 'ignored';
    record.label = 'kept';
    expect(Object.keys(Common.extend({}, { nested: record }).nested)).toEqual(['label']);
    expect(Object.keys(Common.extend({}, false, record))).toEqual(['label']);
    expect(() => Common.get(record, key)).toThrow(TypeError);
    expect(() => Common.set(record, key, 'replacement')).toThrow(TypeError);
    expect(record[key]).toBe('ignored');
});

test('get and set traverse the same slice of an ordinary option path', () => {
    const options = { render: { visible: false } };
    const path = 'options.render.visible.value';
    expect(Common.set(options, path, true, 1, -1)).toBe(true);
    expect(Common.get(options, path, 1, -1)).toBe(true);
    expect(options.render.visible).toBe(true);
});

test('compound inertia uses distances from the mass-weighted centre', () => {
    const a = Bodies.rectangle(0, 0, 10, 10);
    const b = Bodies.rectangle(90, 120, 20, 10);
    const compound = Body.create({ parts: [a, b] });
    expect(compound.position.x).toBeCloseTo(60);
    expect(compound.position.y).toBeCloseTo(80);
    const expected = a.inertia + a.mass * 100 ** 2 + b.inertia + b.mass * 50 ** 2;
    expect(compound.inertia).toBeCloseTo(expected, 10);
    expect(compound.inverseInertia).toBeCloseTo(1 / expected, 12);
});

test('constraints preserve plugin options and have independent defaults', () => {
    const points = { pointA: { x: 0, y: 0 }, pointB: { x: 1, y: 1 } };
    const plugin = { spring: true };
    expect(Constraint.create({ ...points, plugin }).plugin).toBe(plugin);
    expect(Constraint.create(points).plugin).not.toBe(Constraint.create(points).plugin);
});
