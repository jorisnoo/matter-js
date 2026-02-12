const car = function() {
    const { Engine, Render, Runner, Composites, MouseConstraint, Mouse, Composite, Bodies } = Matter;

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
            showCollisions: true
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

    // see car function defined later in this file
    let scale = 0.9;
    Composite.add(world, car.car(150, 100, 150 * scale, 30 * scale, 30 * scale));

    scale = 0.8;
    Composite.add(world, car.car(350, 300, 150 * scale, 30 * scale, 30 * scale));

    Composite.add(world, [
        Bodies.rectangle(200, 150, 400, 20, { isStatic: true, angle: Math.PI * 0.06, render: { fillStyle: '#060a19' }}),
        Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06, render: { fillStyle: '#060a19' }}),
        Bodies.rectangle(300, 560, 600, 20, { isStatic: true, angle: Math.PI * 0.04, render: { fillStyle: '#060a19' }})
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

car.title = 'Car';
car.for = '>=0.14.2';

/**
* Creates a composite with simple car setup of bodies and constraints.
* @method car
* @param {number} xx
* @param {number} yy
* @param {number} width
* @param {number} height
* @param {number} wheelSize
* @return {composite} A new composite car body
*/
car.car = function(xx, yy, width, height, wheelSize) {
    const { Body, Bodies, Composite, Constraint } = Matter;

    const group = Body.nextGroup(true),
        wheelBase = 20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 0;

    const carComposite = new Composite({ label: 'Car' }),
        body = Bodies.rectangle(xx, yy, width, height, {
            collisionFilter: {
                group: group
            },
            chamfer: {
                radius: height * 0.5
            },
            density: 0.0002
        });

    const wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0.8
    });

    const wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0.8
    });

    const axelA = new Constraint({
        bodyB: body,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        length: 0
    });

    const axelB = new Constraint({
        bodyB: body,
        pointB: { x: wheelBOffset, y: wheelYOffset },
        bodyA: wheelB,
        stiffness: 1,
        length: 0
    });

    Composite.addBody(carComposite, body);
    Composite.addBody(carComposite, wheelA);
    Composite.addBody(carComposite, wheelB);
    Composite.addConstraint(carComposite, axelA);
    Composite.addConstraint(carComposite, axelB);

    return carComposite;
};

export default car;
