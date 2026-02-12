const ballPool = function() {
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
    Composite.add(world, [
        Bodies.rectangle(400, 600, 1200, 50.5, { isStatic: true, render: { fillStyle: '#060a19' } })
    ]);

    const stack = Composites.stack(100, 0, 10, 8, 10, 10, (x, y) => {
        return Bodies.circle(x, y, Common.random(15, 30), { restitution: 0.6, friction: 0.1 });
    });

    Composite.add(world, [
        stack,
        Bodies.polygon(200, 460, 3, 60),
        Bodies.polygon(400, 460, 5, 60),
        Bodies.rectangle(600, 460, 80, 80)
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

    // wrapping using matter-wrap plugin
    const allBodies = Composite.allBodies(world);

    for (let i = 0; i < allBodies.length; i += 1) {
        allBodies[i].plugin.wrap = {
            min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
            max: { x: render.bounds.max.x + 100, y: render.bounds.max.y }
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

ballPool.title = 'Ball Pool';
ballPool.for = '>=0.14.2';

export default ballPool;
