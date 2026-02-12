const compoundStack = function() {
    const { Engine, Render, Runner, Body, Composites, MouseConstraint, Mouse, Composite, Bodies } = Matter;

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
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const size = 50;

    const stack = Composites.stack(100, 600 - 17 - size * 6, 12, 6, 0, 0, (x, y) => {
        const partA = Bodies.rectangle(x, y, size, size / 5),
            partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

        return new Body({
            parts: [partA, partB]
        });
    });

    Composite.add(world, [
        stack,
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(400, 609, 800, 50, { isStatic: true })
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

compoundStack.title = 'Compound Stack';
compoundStack.for = '>=0.14.2';

export default compoundStack;
