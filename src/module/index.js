// Pure re-export entry point for bundlers (resolved via the "module"
// condition in package.json). Unlike main.js it performs no namespace
// assembly, so unused modules can be tree-shaken. The default export still
// resolves to the fully assembled Matter namespace from main.js, which is
// only pulled in when the default import is actually used.

export { default as Axes } from '../geometry/Axes.js';
export { default as Bodies } from '../factory/Bodies.js';
export { default as Body } from '../body/Body.js';
export { default as Bounds } from '../geometry/Bounds.js';
export { default as Collision } from '../collision/Collision.js';
export { default as Common } from '../core/Common.js';
export { default as Composite } from '../body/Composite.js';
export { default as Composites } from '../factory/Composites.js';
export { default as Constraint } from '../constraint/Constraint.js';
export { default as Contact } from '../collision/Contact.js';
export { default as Detector } from '../collision/Detector.js';
export { default as Engine } from '../core/Engine.js';
export { default as Events } from '../core/Events.js';
export { default as Mouse } from '../core/Mouse.js';
export { default as MouseConstraint } from '../constraint/MouseConstraint.js';
export { default as Pair } from '../collision/Pair.js';
export { default as Pairs } from '../collision/Pairs.js';
export { default as Plugin } from '../core/Plugin.js';
export { default as Query } from '../collision/Query.js';
export { default as Render } from '../render/Render.js';
export { default as Resolver } from '../collision/Resolver.js';
export { default as Runner } from '../core/Runner.js';
export { default as SAT } from '../collision/SAT.js';
export { default as Sleeping } from '../core/Sleeping.js';
export { default as Svg } from '../geometry/Svg.js';
export { default as Vector } from '../geometry/Vector.js';
export { default as Vertices } from '../geometry/Vertices.js';
export { default as World } from '../body/World.js';

export { default } from './main.js';
