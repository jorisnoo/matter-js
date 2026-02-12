import decomp from 'poly-decomp';

const raycasting = function() {
    const { Engine, Render, Runner, Composite, Composites, Common, Query, MouseConstraint, Mouse, Events, Vertices, Bodies } = Matter;

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
    const stack = Composites.stack(20, 20, 12, 4, 0, 0, function(x, y) {
        switch (Math.round(Common.random(0, 1))) {

        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
            }
        case 1: {
            let sides = Math.round(Common.random(1, 8));
            sides = (sides === 3) ? 4 : sides;
            return Bodies.polygon(x, y, sides, Common.random(20, 50));
        }
        }
    });

    // for testing raycasting on concave bodies
    Common.setDecomp(decomp);

    const star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38'),
        concave = Bodies.fromVertices(200, 200, star);

    Composite.add(world, [
        stack,
        concave,
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    let collisions = [];
    const startPoint = { x: 400, y: 100 };

    Events.on(engine, 'afterUpdate', function() {
        const mouse = mouseConstraint.mouse,
            bodies = Composite.allBodies(engine.world),
            endPoint = mouse.position || { x: 100, y: 600 };

        collisions = Query.ray(bodies, startPoint, endPoint);
    });

    Events.on(render, 'afterRender', function() {
        const mouse = mouseConstraint.mouse,
            context = render.context,
            endPoint = mouse.position || { x: 100, y: 600 };

        Render.startViewTransform(render);

        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        if (collisions.length > 0) {
            context.strokeStyle = '#fff';
        } else {
            context.strokeStyle = '#555';
        }
        context.lineWidth = 0.5;
        context.stroke();

        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];
            context.rect(collision.bodyA.position.x - 4.5, collision.bodyA.position.y - 4.5, 8, 8);
        }

        context.fillStyle = 'rgba(255,165,0,0.7)';
        context.fill();

        Render.endViewTransform(render);
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

raycasting.title = 'Raycasting';
raycasting.for = '>0.16.1';

export default raycasting;
