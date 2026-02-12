const compound = function() {
    const { Engine, Render, Runner, Body, Constraint, Composite, MouseConstraint, Mouse, Bodies } = Matter;

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
            showAxes: true,
            showConvexHulls: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    let size = 200,
        x = 200,
        y = 200;
    const partA = Bodies.rectangle(x, y, size, size / 5),
        partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    const compoundBodyA = new Body({
        parts: [partA, partB]
    });

    size = 150;
    x = 400;
    y = 300;

    const partC = Bodies.circle(x, y, 30),
        partD = Bodies.circle(x + size, y, 30),
        partE = Bodies.circle(x + size, y + size, 30),
        partF = Bodies.circle(x, y + size, 30);

    const compoundBodyB = new Body({
        parts: [partC, partD, partE, partF]
    });

    const constraint = new Constraint({
        pointA: { x: 400, y: 100 },
        bodyB: compoundBodyB,
        pointB: { x: 0, y: 0 }
    });

    Composite.add(world, [
        compoundBodyA,
        compoundBodyB,
        constraint,
        Bodies.rectangle(400, 600, 800, 50.5, { isStatic: true })
    ]);

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
        min: { x: 0, y: 0 },
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

compound.title = 'Compound Bodies';
compound.for = '>=0.14.2';

export default compound;
