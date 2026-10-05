import Matter from '../core/Matter.js';
import Axes from '../geometry/Axes.js';
import Bodies from '../factory/Bodies.js';
import Body from '../body/Body.js';
import Bounds from '../geometry/Bounds.js';
import Collision from '../collision/Collision.js';
import Common from '../core/Common.js';
import Composite from '../body/Composite.js';
import Composites from '../factory/Composites.js';
import Constraint from '../constraint/Constraint.js';
import Contact from '../collision/Contact.js';
import Detector from '../collision/Detector.js';
import Engine from '../core/Engine.js';
import Events from '../core/Events.js';
import Mouse from '../core/Mouse.js';
import MouseConstraint from '../constraint/MouseConstraint.js';
import Pair from '../collision/Pair.js';
import Pairs from '../collision/Pairs.js';
import Plugin from '../core/Plugin.js';
import Query from '../collision/Query.js';
import Render from '../render/Render.js';
import Resolver from '../collision/Resolver.js';
import Runner from '../core/Runner.js';
import SAT from '../collision/SAT.js';
import Sleeping from '../core/Sleeping.js';
import Svg from '../geometry/Svg.js';
import Vector from '../geometry/Vector.js';
import Vertices from '../geometry/Vertices.js';
import World from '../body/World.js';

// Assemble the Matter namespace
Matter.Axes = Axes;
Matter.Bodies = Bodies;
Matter.Body = Body;
Matter.Bounds = Bounds;
Matter.Collision = Collision;
Matter.Common = Common;
Matter.Composite = Composite;
Matter.Composites = Composites;
Matter.Constraint = Constraint;
Matter.Contact = Contact;
Matter.Detector = Detector;
Matter.Engine = Engine;
Matter.Events = Events;
Matter.Mouse = Mouse;
Matter.MouseConstraint = MouseConstraint;
Matter.Pair = Pair;
Matter.Pairs = Pairs;
Matter.Plugin = Plugin;
Matter.Query = Query;
Matter.Render = Render;
Matter.Resolver = Resolver;
Matter.Runner = Runner;
Matter.SAT = SAT;
Matter.Sleeping = Sleeping;
Matter.Svg = Svg;
Matter.Vector = Vector;
Matter.Vertices = Vertices;
Matter.World = World;

// Named exports for tree-shaking
export {
    Axes,
    Bodies,
    Body,
    Bounds,
    Collision,
    Common,
    Composite,
    Composites,
    Constraint,
    Contact,
    Detector,
    Engine,
    Events,
    Mouse,
    MouseConstraint,
    Pair,
    Pairs,
    Plugin,
    Query,
    Render,
    Resolver,
    Runner,
    SAT,
    Sleeping,
    Svg,
    Vector,
    Vertices,
    World
};

// Default export for convenience
export default Matter;
