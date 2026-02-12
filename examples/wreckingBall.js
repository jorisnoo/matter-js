const wreckingBall = function() {
    const { Engine, Render, Runner, Composites, MouseConstraint, Mouse, Composite, Constraint, Bodies } = Matter;

    // create engine
    const engine = new Engine();
    const world = engine.world;

    // create renderer
    const render = new Render({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const rows = 10;
    const yy = 600 - 25 - 40 * rows;

    const stack = Composites.stack(400, yy, 5, rows, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 40, 40);
    });

    Composite.add(world, [
        stack,
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    const ball = Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005});

    Composite.add(world, ball);
    Composite.add(world, new Constraint({
        pointA: { x: 300, y: 100 },
        bodyB: ball
    }));

    // add mouse control
    const mouse = new Mouse(render.canvas);
    const mouseConstraint = new MouseConstraint(engine, {
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

wreckingBall.title = 'Wrecking Ball';
wreckingBall.for = '>=0.14.2';

export default wreckingBall;
