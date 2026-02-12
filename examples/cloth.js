const cloth = function() {
    const { Engine, Render, Runner, Body, Composites, MouseConstraint, Mouse, Composite, Bodies } = Matter;

    // create engine
    const engine = new Engine(),
        world = engine.world;

    // create renderer
    const render = new Render({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600
        }
    });

    Render.run(render);

    // create runner
    const runner = new Runner();
    Runner.run(runner, engine);

    // see cloth function defined later in this file
    const clothBody = cloth.cloth(200, 200, 20, 12, 5, 5, false, 8);

    for (let i = 0; i < 20; i++) {
        clothBody.bodies[i].isStatic = true;
    }

    Composite.add(world, [
        clothBody,
        Bodies.circle(300, 500, 80, { isStatic: true, render: { fillStyle: '#060a19' }}),
        Bodies.rectangle(500, 480, 80, 80, { isStatic: true, render: { fillStyle: '#060a19' }}),
        Bodies.rectangle(400, 609, 800, 50, { isStatic: true })
    ]);

    // add mouse control
    const mouse = new Mouse(render.canvas),
        mouseConstraint = new MouseConstraint(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.98,
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

cloth.title = 'Cloth';
cloth.for = '>=0.14.2';

/**
* Creates a simple cloth like object.
* @method cloth
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
* @return {composite} A new composite cloth
*/
cloth.cloth = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
    const { Body, Bodies, Common, Composites } = Matter;

    const group = Body.nextGroup(true);
    particleOptions = Common.extend({ inertia: Infinity, friction: 0.00001, collisionFilter: { group: group }, render: { visible: false }}, particleOptions);
    constraintOptions = Common.extend({ stiffness: 0.06, render: { type: 'line', anchors: false } }, constraintOptions);

    const clothComposite = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, (x, y) => {
        return Bodies.circle(x, y, particleRadius, particleOptions);
    });

    Composites.mesh(clothComposite, columns, rows, crossBrace, constraintOptions);

    clothComposite.label = 'Cloth Body';

    return clothComposite;
};

export default cloth;
