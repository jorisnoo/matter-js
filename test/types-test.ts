/**
 * TypeScript consumer test file.
 * This file validates that the type definitions work correctly.
 * It should compile without errors using `tsc --noEmit`.
 */

import Matter, {
    Engine,
    Render,
    Runner,
    Body,
    Bodies,
    Composite,
    Composites,
    Constraint,
    MouseConstraint,
    Mouse,
    Events,
    Vector,
    Vertices,
    Bounds,
    Query,
    Common,
    Detector,
    Collision,
    Pair,
    Pairs,
    Contact,
    Sleeping,
    Axes,
    Svg,
    World,
    Plugin,
    Resolver,
    SAT,
} from '../types/matter-js';

// ---- Engine ----
const engine: Engine = Engine.create();
const engineWithOptions: Engine = Engine.create({
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 4,
    enableSleeping: true,
    gravity: { x: 0, y: 1, scale: 0.001 },
});
Engine.update(engine, 1000 / 60);
Engine.clear(engine);
Engine.merge(engine, engineWithOptions);

// ---- Runner ----
const runner: Runner = Runner.create({ delta: 1000 / 60 });
Runner.run(runner, engine);
Runner.tick(runner, engine, performance.now());
Runner.stop(runner);

// ---- Render ----
const render: Render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false,
        showAngleIndicator: true,
    },
});
Render.run(render);
Render.stop(render);
Render.setPixelRatio(render, 2);
Render.setPixelRatio(render, 'auto');
Render.setSize(render, 1024, 768);
Render.lookAt(render, [engine.world]);
Render.startViewTransform(render);
Render.endViewTransform(render);
Render.world(render);

// ---- Body & Bodies ----
const body: Body = new Body({ label: 'Test Body' });
const body2: Body = Body.create({ isStatic: true });
const rect: Body = Bodies.rectangle(400, 200, 80, 80);
const circle: Body = Bodies.circle(400, 200, 40);
const polygon: Body = Bodies.polygon(400, 200, 5, 40);
const trapezoid: Body = Bodies.trapezoid(400, 200, 80, 40, 0.5);

Body.setStatic(body, true);
Body.setMass(body, 10);
Body.setDensity(body, 0.01);
Body.setInertia(body, 100);
Body.setPosition(body, { x: 100, y: 100 });
Body.setPosition(body, { x: 100, y: 100 }, true);
Body.setAngle(body, Math.PI / 4);
Body.setAngle(body, Math.PI / 4, true);
Body.setVelocity(body, { x: 5, y: 0 });
Body.setAngularVelocity(body, 0.1);
Body.setSpeed(body, 10);
Body.setAngularSpeed(body, 0.5);
Body.translate(body, { x: 10, y: 0 });
Body.rotate(body, Math.PI / 8);
Body.rotate(body, Math.PI / 8, { x: 0, y: 0 });
Body.scale(body, 1.5, 1.5);
Body.applyForce(body, body.position, { x: 0.05, y: 0 });
Body.update(body);
Body.updateVelocities(body);
Body.setCentre(body, { x: 0, y: 0 }, true);
Body.setParts(body, [body2], true);

const velocity: Vector = Body.getVelocity(body);
const speed: number = Body.getSpeed(body);
const angVel: number = Body.getAngularVelocity(body);
const angSpeed: number = Body.getAngularSpeed(body);
const group: number = Body.nextGroup(true);
const category: number = Body.nextCategory();

Body.set(body, { friction: 0.5, restitution: 0.8 });
Body.set(body, 'label', 'Updated');

// ---- Composite ----
const composite: Composite = Composite.create({ label: 'My Composite' });
Composite.add(composite, body);
Composite.add(composite, [body, rect]);
Composite.add(composite, Constraint.create({ bodyA: body, bodyB: rect }));
Composite.remove(composite, body);
Composite.remove(composite, body, true);
Composite.addBody(composite, body);
Composite.removeBody(composite, body, true);

const allBodies: Body[] = Composite.allBodies(engine.world);
const allConstraints: Constraint[] = Composite.allConstraints(engine.world);
const allComposites: Composite[] = Composite.allComposites(engine.world);
const found = Composite.get(composite, 1, 'body');

Composite.clear(composite, true);
Composite.clear(composite, false, true);
Composite.translate(composite, { x: 10, y: 0 });
Composite.rotate(composite, Math.PI / 4, { x: 0, y: 0 });
Composite.scale(composite, 2, 2, { x: 0, y: 0 });
Composite.rebase(composite);
Composite.move(composite, [body], engine.world);
const compositeBounds: Bounds = Composite.bounds(composite);

// ---- Constraint ----
const constraint: Constraint = Constraint.create({
    bodyA: body,
    bodyB: rect,
    stiffness: 0.5,
    length: 100,
});
const newConstraint: Constraint = new Constraint({ bodyA: body, pointB: { x: 0, y: 0 } });
const pointAWorld: Vector = Constraint.pointAWorld(constraint);
const pointBWorld: Vector = Constraint.pointBWorld(constraint);
const currentLength: number = Constraint.currentLength(constraint);

// ---- MouseConstraint ----
const mouse: Mouse = Mouse.create(render.canvas);
const mouseConstraint: MouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { category: 0x0001, mask: 0xFFFFFFFF, group: 0 },
});
Composite.add(engine.world, mouseConstraint);

// ---- Mouse ----
Mouse.setElement(mouse, document.body);
Mouse.setOffset(mouse, { x: 0, y: 0 });
Mouse.setScale(mouse, { x: 1, y: 1 });
Mouse.clearSourceEvents(mouse);
const mousePos: Vector = mouse.position;
const mouseBtn: number = mouse.button;

// ---- Events (generic) ----
Events.on(engine, 'beforeUpdate', (event) => {
    const delta: number = event.delta;
    const timestamp: number = event.timestamp;
});

Events.on(engine, 'collisionStart', (event) => {
    const pairs: Pair[] = event.pairs;
});

Events.on(runner, 'beforeTick', (event) => {
    const timestamp: number = event.timestamp;
});

Events.on(mouseConstraint, 'startdrag', (event) => {
    const dragBody: Body = event.body;
    const dragMouse: Mouse = event.mouse;
});

Events.on(mouseConstraint, 'mousedown', (event) => {
    const eventMouse: Mouse = event.mouse;
});

Events.on(body, 'sleepStart', (_event) => {});

Events.off(engine, 'beforeUpdate');
Events.off(engine);
Events.trigger(engine, 'customEvent', { data: 'test' });

// ---- Vector ----
const vec: Vector = Vector.create(10, 20);
const vecClone: Vector = Vector.clone(vec);
const mag: number = Vector.magnitude(vec);
const magSq: number = Vector.magnitudeSquared(vec);
const rotated: Vector = Vector.rotate(vec, Math.PI / 4);
const rotatedAbout: Vector = Vector.rotateAbout(vec, Math.PI / 4, { x: 0, y: 0 });
const normalized: Vector = Vector.normalise(vec);
const dotProduct: number = Vector.dot(vec, vecClone);
const crossProduct: number = Vector.cross(vec, vecClone);
const cross3: number = Vector.cross3(vec, vecClone, { x: 5, y: 5 });
const added: Vector = Vector.add(vec, vecClone);
const subbed: Vector = Vector.sub(vec, vecClone);
const multiplied: Vector = Vector.mult(vec, 2);
const divided: Vector = Vector.div(vec, 2);
const perp: Vector = Vector.perp(vec);
const neg: Vector = Vector.neg(vec);
const angle: number = Vector.angle(vec, vecClone);

// ---- Vertices ----
const verts = Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40');
const centre: Vector = Vertices.centre(verts);
const mean: Vector = Vertices.mean(verts);
const area: number = Vertices.area(verts);
const inertia: number = Vertices.inertia(verts, 1);
Vertices.translate(verts, { x: 10, y: 0 });
Vertices.rotate(verts, Math.PI / 4, { x: 0, y: 0 });
const contains: boolean = Vertices.contains(verts, { x: 20, y: 20 });
Vertices.scale(verts, 2, 2);
const chamfered = Vertices.chamfer(verts, [8]);
const sorted = Vertices.clockwiseSort(verts);
const convex: boolean | null = Vertices.isConvex(verts);
const hull = Vertices.hull(verts);

// ---- Bounds ----
const bounds: Bounds = Bounds.create(verts);
Bounds.update(bounds, verts);
Bounds.update(bounds, verts, { x: 1, y: 0 });
const inBounds: boolean = Bounds.contains(bounds, { x: 20, y: 20 });
const overlaps: boolean = Bounds.overlaps(bounds, bounds);
Bounds.translate(bounds, { x: 10, y: 0 });
Bounds.shift(bounds, { x: 0, y: 0 });

// ---- Axes ----
const axes: Vector[] = Axes.fromVertices(verts);
Axes.rotate(axes, Math.PI / 4);

// ---- Query ----
const collisions: Collision[] = Query.collides(body, allBodies);
const rayCollisions: Collision[] = Query.ray(allBodies, { x: 0, y: 0 }, { x: 100, y: 100 });
const regionBodies: Body[] = Query.region(allBodies, bounds);
const pointBodies: Body[] = Query.point(allBodies, { x: 50, y: 50 });

// ---- Collision ----
const collision: Collision = Collision.create(body, rect);
const collisionResult: Collision | null = Collision.collides(body, rect);

// ---- Detector ----
const detector: Detector = Detector.create();
Detector.setBodies(detector, allBodies);
const detectedCollisions: Collision[] = Detector.collisions(detector);
Detector.clear(detector);
const canCollide: boolean = Detector.canCollide(body.collisionFilter, rect.collisionFilter);

// ---- Pair ----
if (collisionResult) {
    const pair: Pair = Pair.create(collisionResult, 0);
    Pair.update(pair, collisionResult, 1);
    Pair.setActive(pair, true, 2);
    const pairId: string = Pair.id(body, rect);
}

// ---- Pairs ----
const pairs: Pairs = Pairs.create();
Pairs.update(pairs, [], 0);
Pairs.clear(pairs);

// ---- Resolver ----
Resolver.preSolvePosition([]);
Resolver.solvePosition([], 1000 / 60);
Resolver.postSolvePosition(allBodies);
Resolver.preSolveVelocity([]);
Resolver.solveVelocity([], 1000 / 60);

// ---- Sleeping ----
Sleeping.update(allBodies, 1000 / 60);
Sleeping.set(body, true);

// ---- Common ----
const id: number = Common.nextId();
const now: number = Common.now();
const rand: number = Common.random(0, 10);
const clamped: number = Common.clamp(5, 0, 10);
const sign: number = Common.sign(-5);
const isElem: boolean = Common.isElement(document.body);
const isFunc: boolean = Common.isFunction(() => {});
const isPlain: boolean = Common.isPlainObject({});
const color: number = Common.colorToNumber('#ff0000');
Common.log('test');
Common.warn('test');
Common.info('test');
Common.warnOnce('test');

// ---- Plugin ----
Plugin.register({ name: 'test', version: '1.0.0', install: () => {} });
const resolved = Plugin.resolve('test');
Plugin.versionSatisfies('1.0.0', '^1.0.0');
const parsed = Plugin.versionParse('1.0.0');
const parsedDep = Plugin.dependencyParse('test@1.0.0');

// ---- Composites ----
const stack: Composite = Composites.stack(0, 0, 10, 5, 0, 0, (x, y) => {
    return Bodies.rectangle(x, y, 40, 40);
});
const chain: Composite = Composites.chain(stack, 0.5, 0, -0.5, 0, { stiffness: 1 });
const pyramid: Composite = Composites.pyramid(0, 0, 10, 5, 0, 0, (x, y) => {
    return Bodies.rectangle(x, y, 40, 40);
});
const cradle: Composite = Composites.newtonsCradle(300, 100, 5, 30, 200);
const car: Composite = Composites.car(150, 100, 150, 30, 30);
const soft: Composite = Composites.softBody(250, 100, 5, 5, 0, 0, true, 18);

// ---- World (deprecated) ----
const world: Composite = World.create({ label: 'World' });
World.add(world, body);
World.remove(world, body);
World.clear(world, false);

// ---- Default export ----
const matterEngine: Engine = Matter.Engine.create();
const matterBody: Body = Matter.Bodies.rectangle(0, 0, 10, 10);
Matter.Composite.add(matterEngine.world, matterBody);
Matter.use();
