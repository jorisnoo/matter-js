const compositeManipulation = function() {
    const { Engine, Render, Runner, Events, Composite, Composites, MouseConstraint, Mouse, Bodies } = Matter;

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
    Composite.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    const stack = Composites.stack(200, 200, 4, 4, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 40, 40);
    });

    Composite.add(world, stack);

    engine.gravity.y = 0;

    Events.on(engine, 'afterUpdate', function(event) {
        const time = engine.timing.timestamp,
            timeScale = (event.delta || (1000 / 60)) / 1000;

        Composite.translate(stack, {
            x: Math.sin(time * 0.001) * 10 * timeScale,
            y: 0
        });

        Composite.rotate(stack, Math.sin(time * 0.001) * 0.75 * timeScale, {
            x: 300,
            y: 300
        });

        const scale = 1 + (Math.sin(time * 0.001) * 0.75 * timeScale);

        Composite.scale(stack, scale, scale, {
            x: 300,
            y: 300
        });
    });

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

compositeManipulation.title = 'Composite Manipulation';
compositeManipulation.for = '>0.16.1';

export default compositeManipulation;
