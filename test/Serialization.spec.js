import { describe, expect, test } from 'vitest';
import Resurrect from 'matter-tools/libs/resurrect-js/resurrect.js';
import unminified from '../build/matter.js';
import minified from '../build/matter.min.js';

const serializer = Matter => new Resurrect({
    prefix: '$',
    cleanup: true,
    resolver: new Resurrect.NamespaceResolver(Matter),
});

describe('World snapshots from the shipped ESM bundles', () => {
    test.each([
        ['normal to minified', unminified, minified],
        ['minified to normal', minified, unminified],
    ])('%s preserves classes, shared references and a runnable world', (_, source, target) => {
        const engine = source.Engine.create();
        const stack = source.Composite.create({ label: 'Stack' });
        const weight = source.Bodies.rectangle(10, 20, 8, 8);
        const joint = source.Constraint.create({ bodyB: weight, pointA: { x: 10, y: 0 } });
        source.Composite.add(stack, [weight, joint]);
        source.Composite.add(engine.world, stack);
        source.Engine.update(engine);

        const snapshot = serializer(source).stringify(engine.world);
        const world = serializer(target).resurrect(snapshot);
        const [restored] = world.composites;
        const [body] = restored.bodies;
        expect(world).toBeInstanceOf(target.Composite);
        expect(restored).toBeInstanceOf(target.Composite);
        expect(restored.parent).toBe(world);
        expect(restored.label).toBe('Stack');
        expect(restored.constraints[0]).toBeInstanceOf(target.Constraint);
        expect(restored.constraints[0].bodyB).toBe(body);
        expect(body).toBeInstanceOf(target.Body);
        expect(body.parts[0]).toBe(body);
        expect(body.vertices[0].body).toBe(body);
        expect(body.position).toEqual(weight.position);

        const resumed = target.Engine.create();
        target.Engine.merge(resumed, { world });
        target.Engine.update(resumed);
        expect(resumed.detector.bodies).toHaveLength(1);
        expect(resumed.detector.bodies[0]).toBe(body);
        expect(Number.isFinite(body.position.y)).toBe(true);
    });
});
