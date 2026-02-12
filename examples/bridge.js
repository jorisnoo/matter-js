const bridge = function() {
    const { Engine, Render, Runner, Body, Composites, Common, Constraint, MouseConstraint, Mouse, Composite, Bodies } = Matter;

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
    const group = Body.nextGroup(true);

    const bridgeComposite = Composites.stack(160, 290, 15, 1, 0, 0, (x, y) => {
        return Bodies.rectangle(x - 20, y, 53, 20, {
            collisionFilter: { group: group },
            chamfer: 5,
            density: 0.005,
            frictionAir: 0.05,
            render: {
                fillStyle: '#060a19'
            }
        });
    });

    Composites.chain(bridgeComposite, 0.3, 0, -0.3, 0, {
        stiffness: 0.99,
        length: 0.0001,
        render: {
            visible: false
        }
    });

    const stack = Composites.stack(250, 50, 6, 3, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 50, 50, Common.random(20, 40));
    });

    Composite.add(world, [
        bridgeComposite,
        stack,
        Bodies.rectangle(30, 490, 220, 380, {
            isStatic: true,
            chamfer: { radius: 20 }
        }),
        Bodies.rectangle(770, 490, 220, 380, {
            isStatic: true,
            chamfer: { radius: 20 }
        }),
        new Constraint({
            pointA: { x: 140, y: 300 },
            bodyB: bridgeComposite.bodies[0],
            pointB: { x: -25, y: 0 },
            length: 2,
            stiffness: 0.9
        }),
        new Constraint({
            pointA: { x: 660, y: 300 },
            bodyB: bridgeComposite.bodies[bridgeComposite.bodies.length - 1],
            pointB: { x: 25, y: 0 },
            length: 2,
            stiffness: 0.9
        })
    ]);

    // add mouse control
    const mouse = new Mouse(render.canvas),
        mouseConstraint = new MouseConstraint(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.1,
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

bridge.title = 'Bridge';
bridge.for = '>=0.14.2';

export default bridge;
