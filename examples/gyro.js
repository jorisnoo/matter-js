const gyro = function() {
    const { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Bodies } = Matter;

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
    const stack = Composites.stack(20, 20, 10, 5, 0, 0, (x, y) => {
        const sides = Math.round(Common.random(1, 8));

        // round the edges of some bodies
        let chamfer = null;
        if (sides > 2 && Common.random() > 0.7) {
            chamfer = {
                radius: 10
            };
        }

        switch (Math.round(Common.random(0, 1))) {
        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer });
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer });
            }
        case 1:
            return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer });
        }
    });

    Composite.add(world, [
        stack,
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // add gyro control
    let updateGravity;
    if (typeof window !== 'undefined') {
        updateGravity = function(event) {
            const orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0,
                gravity = engine.gravity;

            if (orientation === 0) {
                gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
                gravity.y = Common.clamp(event.beta, -90, 90) / 90;
            } else if (orientation === 180) {
                gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
                gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
            } else if (orientation === 90) {
                gravity.x = Common.clamp(event.beta, -90, 90) / 90;
                gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
            } else if (orientation === -90) {
                gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
                gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
            }
        };

        window.addEventListener('deviceorientation', updateGravity);
    }

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
            if (typeof window !== 'undefined') {
                window.removeEventListener('deviceorientation', updateGravity);
            }
        }
    };
};

gyro.title = 'Gyroscope';
gyro.for = '>=0.14.2';

export default gyro;
