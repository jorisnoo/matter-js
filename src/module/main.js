import Matter from '../core/Matter';
import Axes from '../geometry/Axes';
import Bodies from '../factory/Bodies';
import Body from '../body/Body';
import Bounds from '../geometry/Bounds';
import Collision from '../collision/Collision';
import Common from '../core/Common';
import Composite from '../body/Composite';
import Composites from '../factory/Composites';
import Constraint from '../constraint/Constraint';
import Contact from '../collision/Contact';
import Detector from '../collision/Detector';
import Engine from '../core/Engine';
import Events from '../core/Events';
import Mouse from '../core/Mouse';
import MouseConstraint from '../constraint/MouseConstraint';
import Pair from '../collision/Pair';
import Pairs from '../collision/Pairs';
import Plugin from '../core/Plugin';
import Query from '../collision/Query';
import Render from '../render/Render';
import Resolver from '../collision/Resolver';
import Runner from '../core/Runner';
import SAT from '../collision/SAT';
import Sleeping from '../core/Sleeping';
import Svg from '../geometry/Svg';
import Vector from '../geometry/Vector';
import Vertices from '../geometry/Vertices';
import World from '../body/World';

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
