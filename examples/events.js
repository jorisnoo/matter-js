const events = function() {
    const { Engine, Render, Runner, Body, Events, Composite, Composites, Common, MouseConstraint, Mouse, Bodies } = Matter;

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

    // an example of using composite events on the world
    Events.on(world, 'afterAdd', function(event) {
        // do something with event.object
    });

    let lastTime = Common.now();

    // an example of using beforeUpdate event on an engine
    Events.on(engine, 'beforeUpdate', function(event) {
        const engine = event.source;

        // apply random forces every 5 secs
        if (Common.now() - lastTime >= 5000) {
            shakeScene(engine);

            // update last time
            lastTime = Common.now();
        }
    });

    // an example of using collisionStart event on an engine
    Events.on(engine, 'collisionStart', function(event) {
        const pairs = event.pairs;

        // change object colours to show those starting a collision
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            pair.bodyA.render.fillStyle = '#333';
            pair.bodyB.render.fillStyle = '#333';
        }
    });

    // an example of using collisionActive event on an engine
    Events.on(engine, 'collisionActive', function(event) {
        const pairs = event.pairs;

        // change object colours to show those in an active collision (e.g. resting contact)
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            pair.bodyA.render.fillStyle = '#333';
            pair.bodyB.render.fillStyle = '#333';
        }
    });

    // an example of using collisionEnd event on an engine
    Events.on(engine, 'collisionEnd', function(event) {
        const pairs = event.pairs;

        // change object colours to show those ending a collision
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];

            pair.bodyA.render.fillStyle = '#222';
            pair.bodyB.render.fillStyle = '#222';
        }
    });

    const bodyStyle = { fillStyle: '#222' };

    // scene code
    Composite.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: bodyStyle })
    ]);

    const stack = Composites.stack(70, 100, 9, 4, 50, 50, (x, y) => {
        return Bodies.circle(x, y, 15, { restitution: 1, render: bodyStyle });
    });

    Composite.add(world, stack);

    const shakeScene = function(engine) {
        const timeScale = (1000 / 60) / engine.timing.lastDelta;
        const bodies = Composite.allBodies(engine.world);

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];

            if (!body.isStatic && body.position.y >= 500) {
                // scale force for mass and time applied
                const forceMagnitude = (0.03 * body.mass) * timeScale;

                // apply the force over a single update
                Body.applyForce(body, body.position, {
                    x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]),
                    y: -forceMagnitude + Common.random() * -forceMagnitude
                });
            }
        }
    };

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

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'mousedown', function(event) {
        const mousePosition = event.mouse.position;
        console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
        shakeScene(engine);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'mouseup', function(event) {
        const mousePosition = event.mouse.position;
        console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'startdrag', function(event) {
        console.log('startdrag', event);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'enddrag', function(event) {
        console.log('enddrag', event);
    });

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

events.title = 'Events';
events.for = '>=0.14.2';

export default events;
