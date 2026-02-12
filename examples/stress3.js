const stress3 = function() {
    const { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Bodies } = Matter;

    // create engine
    const engine = new Engine({
        positionIterations: 10,
        velocityIterations: 10
    });

    const world = engine.world;

    // create renderer
    const render = new Render({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showStats: true,
            showPerformance: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const scale = 0.3;

    const stack = Composites.stack(40, 40, 38, 18, 0, 0, function(x, y) {
        const sides = Math.round(Common.random(1, 8));

        switch (Math.round(Common.random(0, 1))) {
        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(25, 50) * scale, Common.random(25, 50) * scale);
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120) * scale, Common.random(25, 30) * scale);
            }
        case 1:
            return Bodies.polygon(x, y, sides, Common.random(25, 50) * scale);
        }
    });

    Composite.add(world, stack);

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
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

stress3.title = 'Stress 3';
stress3.for = '>=0.14.2';

export default stress3;
