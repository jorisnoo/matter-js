// Pure re-export entry point for bundlers (resolved via the "module"
// condition in package.json). Unlike main.js it performs no namespace
// assembly, so unused modules can be tree-shaken. The default export still
// resolves to the fully assembled Matter namespace from main.js, which is
// only pulled in when the default import is actually used.

export { default as Axes } from '../geometry/Axes';
export { default as Bodies } from '../factory/Bodies';
export { default as Body } from '../body/Body';
export { default as Bounds } from '../geometry/Bounds';
export { default as Collision } from '../collision/Collision';
export { default as Common } from '../core/Common';
export { default as Composite } from '../body/Composite';
export { default as Composites } from '../factory/Composites';
export { default as Constraint } from '../constraint/Constraint';
export { default as Contact } from '../collision/Contact';
export { default as Detector } from '../collision/Detector';
export { default as Engine } from '../core/Engine';
export { default as Events } from '../core/Events';
export { default as Mouse } from '../core/Mouse';
export { default as MouseConstraint } from '../constraint/MouseConstraint';
export { default as Pair } from '../collision/Pair';
export { default as Pairs } from '../collision/Pairs';
export { default as Plugin } from '../core/Plugin';
export { default as Query } from '../collision/Query';
export { default as Render } from '../render/Render';
export { default as Resolver } from '../collision/Resolver';
export { default as Runner } from '../core/Runner';
export { default as SAT } from '../collision/SAT';
export { default as Sleeping } from '../core/Sleeping';
export { default as Svg } from '../geometry/Svg';
export { default as Vector } from '../geometry/Vector';
export { default as Vertices } from '../geometry/Vertices';
export { default as World } from '../body/World';

export { default } from './main';
