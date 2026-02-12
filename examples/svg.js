import decomp from 'poly-decomp';

const svg = function() {
    const { Engine, Render, Runner, Common, MouseConstraint, Mouse, Composite, Vertices, Svg, Bodies } = Matter;

    // provide concave decomposition support library
    Common.setDecomp(decomp);

    // create engine
    const engine = new Engine();
    const world = engine.world;

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
    if (typeof fetch !== 'undefined') {
        const select = function(root, selector) {
            return Array.prototype.slice.call(root.querySelectorAll(selector));
        };

        const loadSvg = function(url) {
            return fetch(url)
                .then(function(response) { return response.text(); })
                .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
        };

        ([
            './svg/iconmonstr-check-mark-8-icon.svg',
            './svg/iconmonstr-paperclip-2-icon.svg',
            './svg/iconmonstr-puzzle-icon.svg',
            './svg/iconmonstr-user-icon.svg'
        ]).forEach(function(path, i) {
            loadSvg(path).then(function(root) {
                const color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

                const vertexSets = select(root, 'path')
                    .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.4, 0.4); });

                Composite.add(world, Bodies.fromVertices(100 + i * 150, 200 + i * 50, vertexSets, {
                    render: {
                        fillStyle: color,
                        strokeStyle: color,
                        lineWidth: 1
                    }
                }, true));
            });
        });

        loadSvg('./svg/svg.svg').then(function(root) {
            const color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

            const vertexSets = select(root, 'path')
                .map(function(path) { return Svg.pathToVertices(path, 30); });

            Composite.add(world, Bodies.fromVertices(400, 80, vertexSets, {
                render: {
                    fillStyle: color,
                    strokeStyle: color,
                    lineWidth: 1
                }
            }, true));
        });
    } else {
        Common.warn('Fetch is not available. Could not load SVG.');
    }

    Composite.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // add mouse control
    const mouse = new Mouse(render.canvas);
    const mouseConstraint = new MouseConstraint(engine, {
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

svg.title = 'Concave SVG Paths';
svg.for = '>0.16.1';

export default svg;
