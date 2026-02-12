import decomp from 'poly-decomp';

const concave = function() {
    const { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Vertices, Bodies } = Matter;

    // provide concave decomposition support library
    Common.setDecomp(decomp);

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

    // add bodies
    Composite.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    const arrow = Vertices.fromPath('40 0 40 20 100 20 100 80 40 80 40 100 0 50'),
        chevron = Vertices.fromPath('100 0 75 50 100 100 25 100 0 50 25 0'),
        star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38'),
        horseShoe = Vertices.fromPath('35 7 19 17 14 38 14 58 25 79 45 85 65 84 65 66 46 67 34 59 30 44 33 29 45 23 66 23 66 7 53 7');

    const stack = Composites.stack(50, 50, 6, 4, 10, 10, (x, y) => {
        const color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
        return Bodies.fromVertices(x, y, Common.choose([arrow, chevron, star, horseShoe]), {
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1
            }
        }, true);
    });

    Composite.add(world, stack);

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

concave.title = 'Concave';
concave.for = '>0.16.1';

export default concave;
