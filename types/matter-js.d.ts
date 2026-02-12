// Type definitions for matter-js
// Definitions by: matter-js contributors

export interface Vector {
    x: number;
    y: number;
}

export interface Vertex extends Vector {
    index: number;
    body: Body;
    isInternal: boolean;
}

export interface Bounds {
    min: Vector;
    max: Vector;
}

export interface CollisionFilter {
    category: number;
    mask: number;
    group: number;
}

export interface BodyRenderOptions {
    visible?: boolean;
    opacity?: number;
    strokeStyle?: string | null;
    fillStyle?: string | null;
    lineWidth?: number | null;
    sprite?: {
        texture?: string;
        xScale?: number;
        yScale?: number;
        xOffset?: number;
        yOffset?: number;
    };
}

export interface ConstraintRenderOptions {
    visible?: boolean;
    lineWidth?: number;
    strokeStyle?: string;
    type?: 'line' | 'pin' | 'spring';
    anchors?: boolean;
}

export interface Gravity {
    x: number;
    y: number;
    scale: number;
}

export interface Timing {
    timestamp: number;
    timeScale: number;
    lastDelta: number;
    lastElapsed: number;
    lastUpdatesPerFrame?: number;
}

export interface ChamferOptions {
    radius?: number | number[];
    quality?: number;
    qualityMin?: number;
    qualityMax?: number;
}

export interface BodyOptions {
    id?: number;
    type?: string;
    label?: string;
    parts?: Body[];
    plugin?: Record<string, unknown>;
    angle?: number;
    vertices?: Vector[];
    position?: Vector;
    force?: Vector;
    torque?: number;
    positionImpulse?: Vector;
    constraintImpulse?: { x: number; y: number; angle: number };
    totalContacts?: number;
    speed?: number;
    angularSpeed?: number;
    velocity?: Vector;
    angularVelocity?: number;
    isSensor?: boolean;
    isStatic?: boolean;
    isSleeping?: boolean;
    motion?: number;
    sleepThreshold?: number;
    density?: number;
    restitution?: number;
    friction?: number;
    frictionStatic?: number;
    frictionAir?: number;
    collisionFilter?: Partial<CollisionFilter>;
    slop?: number;
    timeScale?: number;
    render?: BodyRenderOptions;
    chamfer?: ChamferOptions | null;
    circleRadius?: number;
    bounds?: Bounds;
    axes?: Vector[];
    area?: number;
    mass?: number;
    inertia?: number;
    parent?: Body;
}

export interface ConstraintOptions {
    id?: number;
    label?: string;
    type?: string;
    bodyA?: Body | null;
    bodyB?: Body | null;
    pointA?: Vector;
    pointB?: Vector;
    length?: number;
    stiffness?: number;
    damping?: number;
    angularStiffness?: number;
    render?: ConstraintRenderOptions;
    plugin?: Record<string, unknown>;
}

export interface CompositeOptions {
    id?: number;
    type?: string;
    parent?: Composite | null;
    isModified?: boolean;
    bodies?: Body[];
    constraints?: Constraint[];
    composites?: Composite[];
    label?: string;
    plugin?: Record<string, unknown>;
}

export interface EngineOptions {
    positionIterations?: number;
    velocityIterations?: number;
    constraintIterations?: number;
    enableSleeping?: boolean;
    events?: Record<string, unknown>;
    plugin?: Record<string, unknown>;
    gravity?: Partial<Gravity>;
    timing?: Partial<Timing>;
    world?: Composite;
    pairs?: Pairs;
    detector?: Detector;
}

export interface RenderOptions {
    width?: number;
    height?: number;
    pixelRatio?: number;
    background?: string;
    wireframeBackground?: string;
    wireframeStrokeStyle?: string;
    hasBounds?: boolean;
    enabled?: boolean;
    wireframes?: boolean;
    showSleeping?: boolean;
    showDebug?: boolean;
    showStats?: boolean;
    showPerformance?: boolean;
    showBounds?: boolean;
    showVelocity?: boolean;
    showCollisions?: boolean;
    showSeparations?: boolean;
    showAxes?: boolean;
    showPositions?: boolean;
    showAngleIndicator?: boolean;
    showIds?: boolean;
    showVertexNumbers?: boolean;
    showConvexHulls?: boolean;
    showInternalEdges?: boolean;
    showMousePosition?: boolean;
}

export interface RenderCreateOptions {
    engine?: Engine | null;
    element?: HTMLElement | null;
    canvas?: HTMLCanvasElement | null;
    mouse?: Mouse | null;
    bounds?: Bounds;
    options?: RenderOptions;
}

export interface RunnerOptions {
    delta?: number;
    frameDelta?: number | null;
    frameDeltaSmoothing?: boolean;
    frameDeltaSnapping?: boolean;
    frameDeltaHistorySize?: number;
    maxUpdates?: number | null;
    maxFrameTime?: number;
    enabled?: boolean;
}

export interface MouseConstraintOptions {
    mouse?: Mouse;
    element?: HTMLElement;
    constraint?: ConstraintOptions;
    collisionFilter?: Partial<CollisionFilter>;
}

export interface DetectorOptions {
    bodies?: Body[];
    pairs?: Pairs | null;
}

// Event types
export interface Event<S = unknown> {
    name: string;
    source: S;
}

export interface EngineTimingEvent extends Event<Engine> {
    timestamp: number;
    delta: number;
}

export interface EngineCollisionEvent extends Event<Engine> {
    pairs: Pair[];
    timestamp: number;
    delta: number;
}

export interface CompositeEvent extends Event<Composite> {
    object: Body | Constraint | Composite | (Body | Constraint | Composite)[];
}

export interface RunnerEvent extends Event<Runner> {
    timestamp: number;
}

export interface MouseConstraintEvent extends Event<MouseConstraint> {
    mouse: Mouse;
}

export interface MouseConstraintDragEvent extends Event<MouseConstraint> {
    mouse: Mouse;
    body: Body;
}

export interface BodySleepEvent extends Event<Body> {
}

export interface RenderEvent extends Event<Render> {
    timestamp: number;
}

// Event maps for type-safe event handling
export interface EngineEventMap {
    beforeUpdate: EngineTimingEvent;
    beforeSolve: EngineTimingEvent;
    afterUpdate: EngineTimingEvent;
    collisionStart: EngineCollisionEvent;
    collisionActive: EngineCollisionEvent;
    collisionEnd: EngineCollisionEvent;
}

export interface RunnerEventMap {
    beforeTick: RunnerEvent;
    tick: RunnerEvent;
    afterTick: RunnerEvent;
    beforeUpdate: RunnerEvent;
    afterUpdate: RunnerEvent;
}

export interface CompositeEventMap {
    beforeAdd: CompositeEvent;
    afterAdd: CompositeEvent;
    beforeRemove: CompositeEvent;
    afterRemove: CompositeEvent;
}

export interface MouseConstraintEventMap {
    mousedown: MouseConstraintEvent;
    mousemove: MouseConstraintEvent;
    mouseup: MouseConstraintEvent;
    startdrag: MouseConstraintDragEvent;
    enddrag: MouseConstraintDragEvent;
}

export interface BodyEventMap {
    sleepStart: BodySleepEvent;
    sleepEnd: BodySleepEvent;
}

export interface RenderEventMap {
    beforeRender: RenderEvent;
    afterRender: RenderEvent;
}

/**
 * The `Matter.Body` module contains methods for creating and manipulating rigid bodies.
 */
export class Body {
    id: number;
    type: string;
    label: string;
    parts: Body[];
    plugin: Record<string, unknown>;
    angle: number;
    vertices: Vertex[];
    position: Vector;
    force: Vector;
    torque: number;
    positionImpulse: Vector;
    constraintImpulse: { x: number; y: number; angle: number };
    totalContacts: number;
    speed: number;
    angularSpeed: number;
    velocity: Vector;
    angularVelocity: number;
    isSensor: boolean;
    isStatic: boolean;
    isSleeping: boolean;
    motion: number;
    sleepThreshold: number;
    sleepCounter: number;
    density: number;
    restitution: number;
    friction: number;
    frictionStatic: number;
    frictionAir: number;
    collisionFilter: CollisionFilter;
    slop: number;
    timeScale: number;
    render: BodyRenderOptions;
    bounds: Bounds;
    chamfer: ChamferOptions | null;
    circleRadius: number;
    positionPrev: Vector;
    anglePrev: number;
    parent: Body;
    axes: Vector[];
    area: number;
    mass: number;
    inverseMass: number;
    inertia: number;
    inverseInertia: number;
    deltaTime: number;
    events: Record<string, unknown> | null;

    constructor(options?: BodyOptions);

    static create(options?: BodyOptions): Body;
    static nextGroup(isNonColliding?: boolean): number;
    static nextCategory(): number;
    static set(body: Body, settings: string | Partial<BodyOptions>, value?: unknown): void;
    static setStatic(body: Body, isStatic: boolean): void;
    static setMass(body: Body, mass: number): void;
    static setDensity(body: Body, density: number): void;
    static setInertia(body: Body, inertia: number): void;
    static setVertices(body: Body, vertices: Vector[]): void;
    static setParts(body: Body, parts: Body[], autoHull?: boolean): void;
    static setCentre(body: Body, centre: Vector, relative?: boolean): void;
    static setPosition(body: Body, position: Vector, updateVelocity?: boolean): void;
    static setAngle(body: Body, angle: number, updateVelocity?: boolean): void;
    static setVelocity(body: Body, velocity: Vector): void;
    static getVelocity(body: Body): Vector;
    static getSpeed(body: Body): number;
    static setSpeed(body: Body, speed: number): void;
    static setAngularVelocity(body: Body, velocity: number): void;
    static getAngularVelocity(body: Body): number;
    static getAngularSpeed(body: Body): number;
    static setAngularSpeed(body: Body, speed: number): void;
    static translate(body: Body, translation: Vector, updateVelocity?: boolean): void;
    static rotate(body: Body, rotation: number, point?: Vector, updateVelocity?: boolean): void;
    static scale(body: Body, scaleX: number, scaleY: number, point?: Vector): void;
    static update(body: Body, deltaTime?: number): void;
    static updateVelocities(body: Body): void;
    static applyForce(body: Body, position: Vector, force: Vector): void;
}

/**
 * The `Matter.Composite` module is a collection of `Matter.Body`, `Matter.Constraint` and other `Matter.Composite` objects.
 */
export class Composite {
    id: number;
    type: string;
    parent: Composite | null;
    isModified: boolean;
    bodies: Body[];
    constraints: Constraint[];
    composites: Composite[];
    label: string;
    plugin: Record<string, unknown>;
    cache: {
        allBodies: Body[] | null;
        allConstraints: Constraint[] | null;
        allComposites: Composite[] | null;
    };
    gravity?: Gravity;

    constructor(options?: CompositeOptions);

    static create(options?: CompositeOptions): Composite;
    static add(composite: Composite, object: Body | Constraint | Composite | MouseConstraint | (Body | Constraint | Composite | MouseConstraint)[]): Composite;
    static remove(composite: Composite, object: Body | Constraint | Composite | MouseConstraint | (Body | Constraint | Composite | MouseConstraint)[], deep?: boolean): Composite;
    static addBody(composite: Composite, body: Body): Composite;
    static removeBody(composite: Composite, body: Body, deep?: boolean): Composite;
    static addConstraint(composite: Composite, constraint: Constraint): Composite;
    static removeConstraint(composite: Composite, constraint: Constraint, deep?: boolean): Composite;
    static addComposite(compositeA: Composite, compositeB: Composite): Composite;
    static removeComposite(compositeA: Composite, compositeB: Composite, deep?: boolean): Composite;
    static clear(composite: Composite, keepStatic: boolean, deep?: boolean): Composite;
    static allBodies(composite: Composite): Body[];
    static allConstraints(composite: Composite): Constraint[];
    static allComposites(composite: Composite): Composite[];
    static get(composite: Composite, id: number, type: string): Body | Constraint | Composite | null;
    static move(compositeA: Composite, objects: (Body | Constraint | Composite)[], compositeB: Composite): Composite;
    static rebase(composite: Composite): Composite;
    static translate(composite: Composite, translation: Vector, recursive?: boolean): Composite;
    static rotate(composite: Composite, rotation: number, point: Vector, recursive?: boolean): Composite;
    static scale(composite: Composite, scaleX: number, scaleY: number, point: Vector, recursive?: boolean): Composite;
    static bounds(composite: Composite): Bounds;
}

/**
 * The `Matter.Constraint` module contains methods for creating and manipulating constraints.
 */
export class Constraint {
    id: number;
    type: string;
    label: string;
    bodyA: Body | null;
    bodyB: Body | null;
    pointA: Vector;
    pointB: Vector;
    length: number;
    stiffness: number;
    damping: number;
    angularStiffness: number;
    angleA: number;
    angleB: number;
    render: ConstraintRenderOptions;
    plugin: Record<string, unknown>;

    constructor(options?: ConstraintOptions);

    static create(options?: ConstraintOptions): Constraint;
    static pointAWorld(constraint: Constraint): Vector;
    static pointBWorld(constraint: Constraint): Vector;
    static currentLength(constraint: Constraint): number;
}

/**
 * The `Matter.MouseConstraint` module contains methods for creating mouse constraints.
 */
export class MouseConstraint {
    type: string;
    mouse: Mouse;
    element: HTMLElement | null;
    body: Body | null;
    constraint: Constraint;
    collisionFilter: CollisionFilter;

    constructor(engine: Engine, options?: MouseConstraintOptions);

    static create(engine: Engine, options?: MouseConstraintOptions): MouseConstraint;
}

/**
 * The `Matter.Engine` module contains methods for creating and manipulating engines.
 */
export class Engine {
    positionIterations: number;
    velocityIterations: number;
    constraintIterations: number;
    enableSleeping: boolean;
    events: Record<string, unknown>;
    plugin: Record<string, unknown>;
    gravity: Gravity;
    timing: Timing;
    world: Composite;
    pairs: Pairs;
    detector: Detector;

    constructor(options?: EngineOptions);

    static create(options?: EngineOptions): Engine;
    static update(engine: Engine, delta?: number): Engine;
    static merge(engineA: Engine, engineB: Engine): void;
    static clear(engine: Engine): void;
}

/**
 * The `Matter.Runner` module is an optional utility that provides a game loop.
 */
export class Runner {
    delta: number;
    frameDelta: number | null;
    frameDeltaSmoothing: boolean;
    frameDeltaSnapping: boolean;
    frameDeltaHistory: number[];
    frameDeltaHistorySize: number;
    frameRequestId: number | null;
    timeBuffer: number;
    timeLastTick: number | null;
    maxUpdates: number | null;
    maxFrameTime: number;
    lastUpdatesDeferred: number;
    enabled: boolean;
    fps: number;

    constructor(options?: RunnerOptions);

    static create(options?: RunnerOptions): Runner;
    static run(runner: Runner, engine: Engine): Runner;
    static tick(runner: Runner, engine: Engine, time: number): void;
    static stop(runner: Runner): void;
}

/**
 * The `Matter.Render` module is a lightweight canvas-based renderer.
 */
export class Render {
    engine: Engine | null;
    element: HTMLElement | null;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    textures: Record<string, HTMLImageElement>;
    mouse: Mouse | null;
    frameRequestId: number | null;
    timing: Record<string, unknown>;
    options: RenderOptions;
    bounds: Bounds;

    constructor(options?: RenderCreateOptions);

    static create(options?: RenderCreateOptions): Render;
    static run(render: Render): void;
    static stop(render: Render): void;
    static setPixelRatio(render: Render, pixelRatio: number | 'auto'): void;
    static setSize(render: Render, width: number, height: number): void;
    static lookAt(render: Render, objects: unknown | unknown[], padding?: Vector, center?: boolean): void;
    static startViewTransform(render: Render): void;
    static endViewTransform(render: Render): void;
    static world(render: Render, time?: number): void;
}

/**
 * The `Matter.Mouse` module contains methods for creating and manipulating mouse inputs.
 */
export class Mouse {
    element: HTMLElement;
    absolute: Vector;
    position: Vector;
    mousedownPosition: Vector;
    mouseupPosition: Vector;
    offset: Vector;
    scale: Vector;
    wheelDelta: number;
    button: number;
    pixelRatio: number;
    sourceEvents: {
        mousemove: Event | null;
        mousedown: Event | null;
        mouseup: Event | null;
        mousewheel: Event | null;
    };

    constructor(element?: HTMLElement);

    static create(element?: HTMLElement): Mouse;
    static setElement(mouse: Mouse, element: HTMLElement): void;
    static clearSourceEvents(mouse: Mouse): void;
    static setOffset(mouse: Mouse, offset: Vector): void;
    static setScale(mouse: Mouse, scale: Vector): void;
}

/**
 * The `Matter.Events` module contains methods to fire and listen to events on other objects.
 */
export class Events {
    static on(object: Engine, eventNames: 'beforeUpdate' | 'beforeSolve' | 'afterUpdate', callback: (event: EngineTimingEvent) => void): (event: EngineTimingEvent) => void;
    static on(object: Engine, eventNames: 'collisionStart' | 'collisionActive' | 'collisionEnd', callback: (event: EngineCollisionEvent) => void): (event: EngineCollisionEvent) => void;
    static on(object: Runner, eventNames: 'beforeTick' | 'tick' | 'afterTick' | 'beforeUpdate' | 'afterUpdate', callback: (event: RunnerEvent) => void): (event: RunnerEvent) => void;
    static on(object: Composite, eventNames: 'beforeAdd' | 'afterAdd' | 'beforeRemove' | 'afterRemove', callback: (event: CompositeEvent) => void): (event: CompositeEvent) => void;
    static on(object: MouseConstraint, eventNames: 'mousedown' | 'mousemove' | 'mouseup', callback: (event: MouseConstraintEvent) => void): (event: MouseConstraintEvent) => void;
    static on(object: MouseConstraint, eventNames: 'startdrag' | 'enddrag', callback: (event: MouseConstraintDragEvent) => void): (event: MouseConstraintDragEvent) => void;
    static on(object: Body, eventNames: 'sleepStart' | 'sleepEnd', callback: (event: BodySleepEvent) => void): (event: BodySleepEvent) => void;
    static on(object: unknown, eventNames: string, callback: (event: unknown) => void): (event: unknown) => void;

    static off(object: unknown, eventNames?: string, callback?: (event: unknown) => void): void;

    static trigger(object: unknown, eventNames: string, event?: Record<string, unknown>): void;
}

/**
 * The `Matter.Vector` module contains methods for creating and manipulating vectors.
 */
export class Vector {
    static create(x?: number, y?: number): Vector;
    static clone(vector: Vector): Vector;
    static magnitude(vector: Vector): number;
    static magnitudeSquared(vector: Vector): number;
    static rotate(vector: Vector, angle: number, output?: Vector): Vector;
    static rotateAbout(vector: Vector, angle: number, point: Vector, output?: Vector): Vector;
    static normalise(vector: Vector): Vector;
    static dot(vectorA: Vector, vectorB: Vector): number;
    static cross(vectorA: Vector, vectorB: Vector): number;
    static cross3(vectorA: Vector, vectorB: Vector, vectorC: Vector): number;
    static add(vectorA: Vector, vectorB: Vector, output?: Vector): Vector;
    static sub(vectorA: Vector, vectorB: Vector, output?: Vector): Vector;
    static mult(vector: Vector, scalar: number): Vector;
    static div(vector: Vector, scalar: number): Vector;
    static perp(vector: Vector, negate?: boolean): Vector;
    static neg(vector: Vector): Vector;
    static angle(vectorA: Vector, vectorB: Vector): number;
}

/**
 * The `Matter.Vertices` module contains methods for creating and manipulating sets of vertices.
 */
export class Vertices {
    static create(points: Vector[], body: Body): Vertex[];
    static fromPath(path: string, body?: Body): Vertex[];
    static centre(vertices: Vector[]): Vector;
    static mean(vertices: Vector[]): Vector;
    static area(vertices: Vector[], signed?: boolean): number;
    static inertia(vertices: Vector[], mass: number): number;
    static translate(vertices: Vector[], vector: Vector, scalar?: number): Vector[];
    static rotate(vertices: Vector[], angle: number, point: Vector): Vector[] | void;
    static contains(vertices: Vector[], point: Vector): boolean;
    static scale(vertices: Vector[], scaleX: number, scaleY: number, point?: Vector): Vector[];
    static chamfer(vertices: Vector[], radius?: number | number[], quality?: number, qualityMin?: number, qualityMax?: number): Vector[];
    static clockwiseSort(vertices: Vector[]): Vector[];
    static isConvex(vertices: Vector[]): boolean | null;
    static hull(vertices: Vector[]): Vector[];
}

/**
 * The `Matter.Bounds` module contains methods for creating and manipulating axis-aligned bounding boxes (AABB).
 */
export class Bounds {
    static create(vertices?: Vector[]): Bounds;
    static update(bounds: Bounds, vertices: Vector[], velocity?: Vector): void;
    static contains(bounds: Bounds, point: Vector): boolean;
    static overlaps(boundsA: Bounds, boundsB: Bounds): boolean;
    static translate(bounds: Bounds, vector: Vector): void;
    static shift(bounds: Bounds, position: Vector): void;
}

/**
 * The `Matter.Axes` module contains methods for creating and manipulating sets of axes.
 */
export class Axes {
    static fromVertices(vertices: Vector[]): Vector[];
    static rotate(axes: Vector[], angle: number): void;
}

/**
 * The `Matter.Bodies` module contains factory methods for creating rigid body models.
 */
export class Bodies {
    static rectangle(x: number, y: number, width: number, height: number, options?: BodyOptions): Body;
    static trapezoid(x: number, y: number, width: number, height: number, slope: number, options?: BodyOptions): Body;
    static circle(x: number, y: number, radius: number, options?: BodyOptions, maxSides?: number): Body;
    static polygon(x: number, y: number, sides: number, radius: number, options?: BodyOptions): Body;
    static fromVertices(x: number, y: number, vertexSets: Vector[][] | Vector[], options?: BodyOptions, flagInternal?: boolean, removeCollinear?: number, minimumArea?: number, removeDuplicatePoints?: number): Body;
}

/**
 * The `Matter.Composites` module contains factory methods for creating composite bodies.
 */
export class Composites {
    static stack(x: number, y: number, columns: number, rows: number, columnGap: number, rowGap: number, callback: (x: number, y: number, column: number, row: number, lastBody: Body | undefined, i: number) => Body | null): Composite;
    static chain(composite: Composite, xOffsetA: number, yOffsetA: number, xOffsetB: number, yOffsetB: number, options?: ConstraintOptions): Composite;
    static mesh(composite: Composite, columns: number, rows: number, crossBrace: boolean, options?: ConstraintOptions): Composite;
    static pyramid(x: number, y: number, columns: number, rows: number, columnGap: number, rowGap: number, callback: (x: number, y: number, column: number, row: number, lastBody: Body | undefined, i: number) => Body | null): Composite;
    static newtonsCradle(x: number, y: number, number: number, size: number, length: number): Composite;
    static car(x: number, y: number, width: number, height: number, wheelSize: number): Composite;
    static softBody(x: number, y: number, columns: number, rows: number, columnGap: number, rowGap: number, crossBrace: boolean, particleRadius: number, particleOptions?: BodyOptions, constraintOptions?: ConstraintOptions): Composite;
}

/**
 * The `Matter.Collision` module contains methods for detecting collisions between a given pair of bodies.
 */
export class Collision {
    pair: Pair | null;
    collided: boolean;
    bodyA: Body;
    bodyB: Body;
    parentA: Body;
    parentB: Body;
    depth: number;
    normal: Vector;
    tangent: Vector;
    penetration: Vector;
    supports: (Vector | null)[];
    supportCount: number;

    constructor(bodyA: Body, bodyB: Body);

    static create(bodyA: Body, bodyB: Body): Collision;
    static collides(bodyA: Body, bodyB: Body, pairs?: Pairs): Collision | null;
}

/**
 * The `Matter.Contact` module contains methods for creating and manipulating collision contacts.
 */
export class Contact {
    vertex: Vertex;
    normalImpulse: number;
    tangentImpulse: number;

    constructor(vertex?: Vertex);

    static create(vertex?: Vertex): Contact;
}

/**
 * The `Matter.Detector` module contains methods for efficiently detecting collisions between a list of bodies.
 */
export class Detector {
    bodies: Body[];
    collisions: Collision[];
    pairs: Pairs | null;

    constructor(options?: DetectorOptions);

    static create(options?: DetectorOptions): Detector;
    static setBodies(detector: Detector, bodies: Body[]): void;
    static clear(detector: Detector): void;
    static collisions(detector: Detector): Collision[];
    static canCollide(filterA: CollisionFilter, filterB: CollisionFilter): boolean;
}

/**
 * The `Matter.Pair` module contains methods for creating and manipulating collision pairs.
 */
export class Pair {
    id: string;
    bodyA: Body;
    bodyB: Body;
    collision: Collision;
    contacts: Contact[];
    contactCount: number;
    separation: number;
    isActive: boolean;
    isSensor: boolean;
    timeCreated: number;
    timeUpdated: number;
    inverseMass: number;
    friction: number;
    frictionStatic: number;
    restitution: number;
    slop: number;

    constructor(collision: Collision, timestamp: number);

    static create(collision: Collision, timestamp: number): Pair;
    static update(pair: Pair, collision: Collision, timestamp: number): void;
    static setActive(pair: Pair, isActive: boolean, timestamp: number): void;
    static id(bodyA: Body, bodyB: Body): string;
}

/**
 * The `Matter.Pairs` module contains methods for creating and manipulating collision pair sets.
 */
export class Pairs {
    table: Record<string, Pair>;
    list: Pair[];
    collisionStart: Pair[];
    collisionActive: Pair[];
    collisionEnd: Pair[];

    constructor(options?: Record<string, unknown>);

    static create(options?: Record<string, unknown>): Pairs;
    static update(pairs: Pairs, collisions: Collision[], timestamp: number): void;
    static clear(pairs: Pairs): Pairs;
}

/**
 * The `Matter.Query` module contains methods for performing collision queries.
 */
export class Query {
    static collides(body: Body, bodies: Body[]): Collision[];
    static ray(bodies: Body[], startPoint: Vector, endPoint: Vector, rayWidth?: number): Collision[];
    static region(bodies: Body[], bounds: Bounds, outside?: boolean): Body[];
    static point(bodies: Body[], point: Vector): Body[];
}

/**
 * The `Matter.Resolver` module contains methods for resolving collision pairs.
 */
export class Resolver {
    static preSolvePosition(pairs: Pair[]): void;
    static solvePosition(pairs: Pair[], delta: number, damping?: number): void;
    static postSolvePosition(bodies: Body[]): void;
    static preSolveVelocity(pairs: Pair[]): void;
    static solveVelocity(pairs: Pair[], delta: number): void;
}

/**
 * The `Matter.SAT` module. Deprecated, use `Matter.Collision` instead.
 * @deprecated Use Collision.collides instead.
 */
export class SAT {
    /** @deprecated Use Collision.collides instead. */
    static collides(bodyA: Body, bodyB: Body): Collision;
}

/**
 * The `Matter.Sleeping` module contains methods to manage the sleeping state of bodies.
 */
export class Sleeping {
    static update(bodies: Body[], delta: number): void;
    static afterCollisions(pairs: Pair[]): void;
    static set(body: Body, isSleeping: boolean): void;
}

/**
 * The `Matter.Common` module contains utility functions that are common to all modules.
 */
export class Common {
    static logLevel: number;
    static extend(obj: unknown, deep?: boolean, ...sources: unknown[]): unknown;
    static clone(obj: unknown, deep?: boolean): unknown;
    static get(obj: unknown, path: string, begin?: number, end?: number): unknown;
    static set(obj: unknown, path: string, val: unknown, begin?: number, end?: number): unknown;
    static shuffle<T>(array: T[]): T[];
    static choose<T>(choices: T[]): T;
    static isElement(obj: unknown): boolean;
    static isFunction(obj: unknown): boolean;
    static isPlainObject(obj: unknown): boolean;
    static clamp(value: number, min: number, max: number): number;
    static sign(value: number): number;
    static now(): number;
    static random(min?: number, max?: number): number;
    static colorToNumber(colorString: string): number;
    static log(...args: unknown[]): void;
    static info(...args: unknown[]): void;
    static warn(...args: unknown[]): void;
    static warnOnce(...args: unknown[]): void;
    static deprecated(obj: unknown, prop: string, warning: string): void;
    static nextId(): number;
    static topologicalSort(graph: Record<string, string[]>): string[];
    static chain(funcs: Function, ...args: Function[]): Function;
    static chainPathBefore(base: unknown, path: string, func: Function): Function;
    static chainPathAfter(base: unknown, path: string, func: Function): Function;
}

/**
 * The `Matter.Plugin` module contains functions for registering and installing plugins on modules.
 */
export class Plugin {
    static register(plugin: PluginObject): PluginObject;
    static resolve(dependency: string): PluginObject | undefined;
    static toString(plugin: string | PluginObject): string;
    static isPlugin(obj: unknown): boolean;
    static isUsed(module: { used: string[] }, name: string): boolean;
    static isFor(plugin: PluginObject, module: { name: string; version: string }): boolean;
    static use(module: unknown, plugins?: unknown[]): void;
    static dependencies(module: unknown, tracked?: Record<string, string[]>): Record<string, string[]>;
    static dependencyParse(dependency: string | PluginObject): { name: string; range: string };
    static versionParse(range: string): VersionParsed;
    static versionSatisfies(version: string, range: string): boolean;
}

export interface PluginObject {
    name: string;
    version: string;
    install?: (module: unknown) => void;
    for?: string;
    uses?: string[];
    _warned?: boolean;
}

export interface VersionParsed {
    isRange: boolean;
    version: string;
    range: string;
    operator: string;
    major: number;
    minor: number;
    patch: number;
    parts: [number, number, number];
    prerelease: string | undefined;
    number: number;
}

/**
 * The `Matter.Svg` module contains methods for converting SVG images into an array of vector points.
 */
export class Svg {
    static pathToVertices(path: SVGPathElement, sampleLength?: number): Vector[];
}

/**
 * The `Matter.World` module is a deprecated alias for `Matter.Composite`.
 * @deprecated Use Composite instead.
 */
export class World {
    static create: typeof Composite.create;
    static add: typeof Composite.add;
    static remove: typeof Composite.remove;
    static clear: typeof Composite.clear;
    static addComposite: typeof Composite.addComposite;
    static addBody: typeof Composite.addBody;
    static addConstraint: typeof Composite.addConstraint;
}

/**
 * The top-level `Matter` namespace.
 */
export interface MatterStatic {
    name: string;
    version: string;
    uses: unknown[];
    used: string[];
    Axes: typeof Axes;
    Bodies: typeof Bodies;
    Body: typeof Body;
    Bounds: typeof Bounds;
    Collision: typeof Collision;
    Common: typeof Common;
    Composite: typeof Composite;
    Composites: typeof Composites;
    Constraint: typeof Constraint;
    Contact: typeof Contact;
    Detector: typeof Detector;
    Engine: typeof Engine;
    Events: typeof Events;
    Mouse: typeof Mouse;
    MouseConstraint: typeof MouseConstraint;
    Pair: typeof Pair;
    Pairs: typeof Pairs;
    Plugin: typeof Plugin;
    Query: typeof Query;
    Render: typeof Render;
    Resolver: typeof Resolver;
    Runner: typeof Runner;
    SAT: typeof SAT;
    Sleeping: typeof Sleeping;
    Svg: typeof Svg;
    Vector: typeof Vector;
    Vertices: typeof Vertices;
    World: typeof World;
    use(...plugins: (Function | string)[]): void;
    before(path: string, func: Function): Function;
    after(path: string, func: Function): Function;
}

declare const Matter: MatterStatic;
export default Matter;
