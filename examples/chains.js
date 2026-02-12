const chains = function() {
    const { Engine, Render, Runner, Body, Composite, Composites, Constraint, MouseConstraint, Mouse, Bodies } = Matter;

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
    let group = Body.nextGroup(true);

    const ropeA = Composites.stack(100, 50, 8, 1, 10, 10, (x, y) => {
        return Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
    });

    Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
    Composite.add(ropeA, new Constraint({
        bodyB: ropeA.bodies[0],
        pointB: { x: -25, y: 0 },
        pointA: { x: ropeA.bodies[0].position.x, y: ropeA.bodies[0].position.y },
        stiffness: 0.5
    }));

    group = Body.nextGroup(true);

    const ropeB = Composites.stack(350, 50, 10, 1, 10, 10, (x, y) => {
        return Bodies.circle(x, y, 20, { collisionFilter: { group: group } });
    });

    Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
    Composite.add(ropeB, new Constraint({
        bodyB: ropeB.bodies[0],
        pointB: { x: -20, y: 0 },
        pointA: { x: ropeB.bodies[0].position.x, y: ropeB.bodies[0].position.y },
        stiffness: 0.5
    }));

    group = Body.nextGroup(true);

    const ropeC = Composites.stack(600, 50, 13, 1, 10, 10, (x, y) => {
        return Bodies.rectangle(x - 20, y, 50, 20, { collisionFilter: { group: group }, chamfer: 5 });
    });

    Composites.chain(ropeC, 0.3, 0, -0.3, 0, { stiffness: 1, length: 0 });
    Composite.add(ropeC, new Constraint({
        bodyB: ropeC.bodies[0],
        pointB: { x: -20, y: 0 },
        pointA: { x: ropeC.bodies[0].position.x, y: ropeC.bodies[0].position.y },
        stiffness: 0.5
    }));

    Composite.add(world, [
        ropeA,
        ropeB,
        ropeC,
        Bodies.rectangle(400, 600, 1200, 50.5, { isStatic: true })
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
        max: { x: 700, y: 600 }
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

chains.title = 'Chains';
chains.for = '>=0.14.2';

export default chains;
