import decomp from 'poly-decomp';

const terrain = function() {
    const { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Query, Svg, Bodies } = Matter;

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

        loadSvg('./svg/terrain.svg')
            .then(function(root) {
                const paths = select(root, 'path');

                const vertexSets = paths.map(function(path) { return Svg.pathToVertices(path, 30); });

                const terrainBody = Bodies.fromVertices(400, 350, vertexSets, {
                    isStatic: true,
                    render: {
                        fillStyle: '#060a19',
                        strokeStyle: '#060a19',
                        lineWidth: 1
                    }
                }, true);

                Composite.add(world, terrainBody);

                const bodyOptions = {
                    frictionAir: 0,
                    friction: 0.0001,
                    restitution: 0.6
                };

                Composite.add(world, Composites.stack(80, 100, 20, 20, 10, 10, (x, y) => {
                    if (Query.point([terrainBody], { x: x, y: y }).length === 0) {
                        return Bodies.polygon(x, y, 5, 12, bodyOptions);
                    }
                }));
            });
    } else {
        Common.warn('Fetch is not available. Could not load SVG.');
    }

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

terrain.title = 'Terrain';
terrain.for = '>0.16.1';

export default terrain;
