const sleeping = function() {
    const { Engine, Render, Runner, Composites, Common, Events, MouseConstraint, Mouse, Composite, Bodies } = Matter;

    // create engine
    const engine = new Engine({
            enableSleeping: true
        }),
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
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    const stack = Composites.stack(50, 50, 12, 3, 0, 0, function(x, y) {
        switch (Math.round(Common.random(0, 1))) {

        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
            }
        case 1:
            return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

        }
    });

    Composite.add(world, stack);

    /*
    // sleep events
    for (var i = 0; i < stack.bodies.length; i++) {
        Events.on(stack.bodies[i], 'sleepStart sleepEnd', function(event) {
            var body = this;
            console.log('body id', body.id, 'sleeping:', body.isSleeping);
        });
    }
    */

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

sleeping.title = 'Sleeping';
sleeping.for = '>=0.14.2';

export default sleeping;
