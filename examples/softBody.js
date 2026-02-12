const softBody = function() {
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
            showAngleIndicator: false
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // add bodies
    const particleOptions = {
        friction: 0.05,
        frictionStatic: 0.1,
        render: { visible: true }
    };

    Composite.add(world, [
        // see softBody function defined later in this file
        softBody.softBody(250, 100, 5, 5, 0, 0, true, 18, particleOptions),
        softBody.softBody(400, 300, 8, 3, 0, 0, true, 15, particleOptions),
        softBody.softBody(250, 400, 4, 4, 0, 0, true, 15, particleOptions),
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // add mouse control
    const mouse = new Mouse(render.canvas),
        mouseConstraint = new MouseConstraint(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.9,
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

softBody.title = 'Soft Body';
softBody.for = '>=0.14.2';

/**
* Creates a simple soft body like object.
* @method softBody
* @param {number} xx
* @param {number} yy
* @param {number} columns
* @param {number} rows
* @param {number} columnGap
* @param {number} rowGap
* @param {boolean} crossBrace
* @param {number} particleRadius
* @param {} particleOptions
* @param {} constraintOptions
* @return {composite} A new composite softBody
*/
softBody.softBody = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
    const { Common, Composites, Bodies } = Matter;

    particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
    constraintOptions = Common.extend({ stiffness: 0.2, render: { type: 'line', anchors: false } }, constraintOptions);

    const softBodyComposite = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, (x, y) => {
        return Bodies.circle(x, y, particleRadius, particleOptions);
    });

    Composites.mesh(softBodyComposite, columns, rows, crossBrace, constraintOptions);

    softBodyComposite.label = 'Soft Body';

    return softBodyComposite;
};

export default softBody;
