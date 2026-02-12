const catapult = function() {
    const { Engine, Render, Runner, Composites, Constraint, MouseConstraint, Mouse, Composite, Bodies, Body, Vector } = Matter;

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
            showAngleIndicator: true,
            showCollisions: true,
            showVelocity: true
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const group = Body.nextGroup(true);

    const stack = Composites.stack(250, 255, 1, 6, 0, 0, (x, y) => {
        return Bodies.rectangle(x, y, 30, 30);
    });

    const catapultBody = Bodies.rectangle(400, 520, 320, 20, { collisionFilter: { group: group } });

    Composite.add(world, [
        stack,
        catapultBody,
        Bodies.rectangle(400, 600, 800, 50.5, { isStatic: true, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(250, 555, 20, 50, { isStatic: true, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(400, 535, 20, 80, { isStatic: true, collisionFilter: { group: group }, render: { fillStyle: '#060a19' } }),
        Bodies.circle(560, 100, 50, { density: 0.005 }),
        new Constraint({
            bodyA: catapultBody,
            pointB: Vector.clone(catapultBody.position),
            stiffness: 1,
            length: 0
        })
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

catapult.title = 'Catapult';
catapult.for = '>=0.14.2';

export default catapult;
