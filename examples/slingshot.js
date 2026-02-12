const slingshot = function() {
    const { Engine, Render, Runner, Composites, Events, Constraint, MouseConstraint, Mouse, Body, Composite, Bodies } = Matter;

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
    const ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true, render: { fillStyle: '#060a19' } }),
        rockOptions = { density: 0.004 };
    let rock = Bodies.polygon(170, 450, 8, 20, rockOptions);
    const anchor = { x: 170, y: 450 },
        elastic = new Constraint({
            pointA: anchor,
            bodyB: rock,
            length: 0.01,
            damping: 0.01,
            stiffness: 0.05
        });

    const pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 25, 40);
    });

    const ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true, render: { fillStyle: '#060a19' } });

    const pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 25, 40);
    });

    Composite.add(engine.world, [ground, pyramid, ground2, pyramid2, rock, elastic]);

    Events.on(engine, 'afterUpdate', function() {
        if (mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
            // Limit maximum speed of current rock.
            if (Body.getSpeed(rock) > 45) {
                Body.setSpeed(rock, 45);
            }

            // Release current rock and add a new one.
            rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
            Composite.add(engine.world, rock);
            elastic.bodyB = rock;
        }
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

slingshot.title = 'Slingshot';
slingshot.for = '>=0.14.2';

export default slingshot;
