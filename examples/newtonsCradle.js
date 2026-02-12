const newtonsCradle = function() {
    const { Engine, Render, Runner, Body, Composites, MouseConstraint, Mouse, Composite } = Matter;

    // create engine
    const engine = new Engine(),
        world = engine.world;

    // create renderer
    const render = new Render({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showVelocity: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // see newtonsCradle function defined later in this file
    let cradle = newtonsCradle.newtonsCradle(280, 100, 5, 30, 200);
    Composite.add(world, cradle);
    Body.translate(cradle.bodies[0], { x: -180, y: -100 });

    cradle = newtonsCradle.newtonsCradle(280, 380, 7, 20, 140);
    Composite.add(world, cradle);
    Body.translate(cradle.bodies[0], { x: -140, y: -100 });

    // add mouse control
    const mouse = new Mouse(render.canvas),
        mouseConstraint = new MouseConstraint(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 50 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop() {
            Render.stop(render);
            Runner.stop(runner);
        }
    };
};

newtonsCradle.title = 'Newton\'s Cradle';
newtonsCradle.for = '>=0.14.2';

/**
* Creates a composite with a Newton's Cradle setup of bodies and constraints.
* @method newtonsCradle
* @param {number} xx
* @param {number} yy
* @param {number} number
* @param {number} size
* @param {number} length
* @return {composite} A new composite newtonsCradle body
*/
newtonsCradle.newtonsCradle = function(xx, yy, number, size, length) {
    const Composite = Matter.Composite,
        Constraint = Matter.Constraint,
        Bodies = Matter.Bodies;

    const newtonsCradle = new Composite({ label: 'Newtons Cradle' });

    for (let i = 0; i < number; i++) {
        const separation = 1.9,
            circle = Bodies.circle(xx + i * (size * separation), yy + length, size,
                { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: size * 0.02 }),
            constraint = new Constraint({ pointA: { x: xx + i * (size * separation), y: yy }, bodyB: circle });

        Composite.addBody(newtonsCradle, circle);
        Composite.addConstraint(newtonsCradle, constraint);
    }

    return newtonsCradle;
};

export default newtonsCradle;
