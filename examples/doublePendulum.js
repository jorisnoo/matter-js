const doublePendulum = function() {
    const { Engine, Events, Render, Runner, Body, Composite, Composites, Constraint, MouseConstraint, Mouse, Bodies, Vector } = Matter;

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
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const group = Body.nextGroup(true),
        length = 200,
        width = 25;

    const pendulum = Composites.stack(350, 160, 2, 1, -20, 0, (x, y) => {
        return Bodies.rectangle(x, y, length, width, {
            collisionFilter: { group: group },
            frictionAir: 0,
            chamfer: 5,
            render: {
                fillStyle: 'transparent',
                lineWidth: 1
            }
        });
    });

    engine.gravity.scale = 0.002;

    Composites.chain(pendulum, 0.45, 0, -0.45, 0, {
        stiffness: 0.9,
        length: 0,
        angularStiffness: 0.7,
        render: {
            strokeStyle: '#4a485b'
        }
    });

    Composite.add(pendulum, new Constraint({
        bodyB: pendulum.bodies[0],
        pointB: { x: -length * 0.42, y: 0 },
        pointA: { x: pendulum.bodies[0].position.x - length * 0.42, y: pendulum.bodies[0].position.y },
        stiffness: 0.9,
        length: 0,
        render: {
            strokeStyle: '#4a485b'
        }
    }));

    const lowerArm = pendulum.bodies[1];

    Body.rotate(lowerArm, -Math.PI * 0.3, {
        x: lowerArm.position.x - 100,
        y: lowerArm.position.y
    });

    Composite.add(world, pendulum);

    const trail = [];

    Events.on(render, 'afterRender', function() {
        trail.unshift({
            position: Vector.clone(lowerArm.position),
            speed: lowerArm.speed
        });

        Render.startViewTransform(render);
        render.context.globalAlpha = 0.7;

        for (let i = 0; i < trail.length; i += 1) {
            const point = trail[i].position,
                speed = trail[i].speed;

            const hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
            render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
            render.context.fillRect(point.x, point.y, 2, 2);
        }

        render.context.globalAlpha = 1;
        Render.endViewTransform(render);

        if (trail.length > 2000) {
            trail.pop();
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

doublePendulum.title = 'Double Pendulum';
doublePendulum.for = '>0.16.1';

export default doublePendulum;
