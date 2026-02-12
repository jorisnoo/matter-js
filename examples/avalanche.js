const avalanche = function() {
    try {
        if (typeof MatterWrap !== 'undefined') {
            Matter.use('matter-wrap');
        }
    } catch (e) {
        // plugin not available
    }

    const { Engine, Render, Runner, Composite, Composites, Common, MouseConstraint, Mouse, Bodies } = Matter;

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
    const stack = Composites.stack(20, 20, 20, 5, 0, 0, (x, y) => {
        return Bodies.circle(x, y, Common.random(10, 20), { friction: 0.00001, restitution: 0.5, density: 0.001 });
    });

    Composite.add(world, stack);

    Composite.add(world, [
        Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(500, 350, 700, 20, { isStatic: true, angle: -Math.PI * 0.06, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04, render: { fillStyle: '#060a19' } })
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
    Render.lookAt(render, Composite.allBodies(world));

    // wrapping using matter-wrap plugin
    for (let i = 0; i < stack.bodies.length; i += 1) {
        stack.bodies[i].plugin.wrap = {
            min: { x: render.bounds.min.x, y: render.bounds.min.y },
            max: { x: render.bounds.max.x, y: render.bounds.max.y }
        };
    }

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

avalanche.title = 'Avalanche';
avalanche.for = '>=0.14.2';

export default avalanche;
