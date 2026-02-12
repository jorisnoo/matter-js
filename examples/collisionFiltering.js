const collisionFiltering = function() {
    const { Engine, Render, Runner, Composite, Composites, Common, MouseConstraint, Mouse, Bodies } = Matter;

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

    // define our categories (as bit fields, there are up to 32 available)
    const defaultCategory = 0x0001,
        redCategory = 0x0002,
        greenCategory = 0x0004,
        blueCategory = 0x0008;

    const colorA = '#f55a3c',
        colorB = '#063e7b',
        colorC = '#f5d259';

    // add floor
    Composite.add(world, Bodies.rectangle(400, 600, 900, 50, {
        isStatic: true,
        render: {
            fillStyle: 'transparent',
            lineWidth: 1
        }
    }));

    // create a stack with varying body categories (but these bodies can all collide with each other)
    Composite.add(world,
        Composites.stack(275, 100, 5, 9, 10, 10, (x, y, column, row) => {
            let category = redCategory,
                color = colorA;

            if (row > 5) {
                category = blueCategory;
                color = colorB;
            } else if (row > 2) {
                category = greenCategory;
                color = colorC;
            }

            return Bodies.circle(x, y, 20, {
                collisionFilter: {
                    category: category
                },
                render: {
                    strokeStyle: color,
                    fillStyle: 'transparent',
                    lineWidth: 1
                }
            });
        })
    );

    // this body will only collide with the walls and the green bodies
    Composite.add(world,
        Bodies.circle(310, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | greenCategory
            },
            render: {
                fillStyle: colorC
            }
        })
    );

    // this body will only collide with the walls and the red bodies
    Composite.add(world,
        Bodies.circle(400, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | redCategory
            },
            render: {
                fillStyle: colorA
            }
        })
    );

    // this body will only collide with the walls and the blue bodies
    Composite.add(world,
        Bodies.circle(480, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | blueCategory
            },
            render: {
                fillStyle: colorB
            }
        })
    );

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

    // red category objects should not be draggable with the mouse
    mouseConstraint.collisionFilter.mask = defaultCategory | blueCategory | greenCategory;

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

collisionFiltering.title = 'Collision Filtering';
collisionFiltering.for = '>=0.14.2';

export default collisionFiltering;
