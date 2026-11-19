/**
* A Matter.js demo and development testbed based on MatterTools.
*
* For a simpler, minimal Matter.js example see:
* https://github.com/liabru/matter-js/wiki/Getting-started
*
* The source for examples can be found at `/examples/`.
*
* @module Demo
*/

import MatterTools from 'matter-tools';

var demo = function(examples, isDev) {
    // The serializer embedded in matter-tools otherwise looks up ESM classes on window.
    Matter.Common.chainPathAfter(MatterTools, 'Serializer.create', function() {
        this.resolver = new this.constructor.NamespaceResolver(Matter);
    });

    var demo = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js' + (isDev ? ' ・ dev' : ''),
            url: 'https://github.com/liabru/matter-js',
            reset: true,
            source: true,
            inspector: true,
            tools: true,
            fullscreen: true,
            exampleSelect: true
        },
        tools: {
            inspector: true,
            gui: true
        },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: true,
        startExample: false,
        examples: examples
    });

    window.MatterDemoInstance = demo;

    document.body.appendChild(demo.dom.root);
    document.title = 'Matter.js Demo' + (isDev ? ' ・ Dev' : '');

    if (isDev) {
        // add delta control
        Matter.Common.chainPathAfter(MatterTools, 'Gui.create', function() {
            this.datGui.__folders["Engine"]
                .add(demo, "delta", 0, 1000 / 55)
                .onChange(function() {
                    var runner = demo.example.instance.runner;
                    runner.delta = demo.delta;
                })
                .step(0.001)
                .listen();
        });

        Matter.after('Runner.create', function() {
            demo.delta = this.delta;
        });

        // add compare button
        var buttonSource = demo.dom.buttonSource,
            buttonCompare = buttonSource.cloneNode(true);

        buttonCompare.textContent = '⎄';
        buttonCompare.title = 'Compare';
        buttonCompare.href = '?compare';
        buttonCompare.target = '';
        buttonCompare.className = 'matter-btn matter-btn-compare';
        buttonCompare.addEventListener('click', function(event) {
            window.location = '?compare#' + demo.example.id;
            event.preventDefault();
        });

        buttonSource.parentNode.insertBefore(buttonCompare, buttonSource.nextSibling);

        Matter.before('Render.create', function(renderOptions) {
            // custom render options in development demo
            renderOptions.options.showDebug = true;
            renderOptions.options.pixelRatio = 'auto';
            renderOptions.options.wireframeStrokeStyle = '#aaa';
        });

        // arrow key navigation of examples
        document.addEventListener('keyup', function(event) {
            var isBackKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp',
                isForwardKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';

            if (isBackKey || isForwardKey) {
                var direction = isBackKey ? -1 : 1,
                    currentExampleIndex = demo.examples.findIndex(function(example) { 
                        return example.id === demo.example.id;
                    }),
                    nextExample = demo.examples[(demo.examples.length + currentExampleIndex + direction) % demo.examples.length];
                
                MatterTools.Demo.setExample(demo, nextExample);
            }
        });
    }

    // A loaded world replaces the composite, but the Inspector tree and the
    // example's live mouse handler still reference objects from the old world.
    const loadState = MatterTools.Serializer.loadState;
    MatterTools.Serializer.loadState = function(serializer, engine, key) {
        const previous = engine.world;
        loadState(serializer, engine, key);
        const world = engine.world;
        if (world === previous) return;

        const mouse = previous.constraints.find(c => c.label === 'Mouse Constraint');
        const savedMouse = world.constraints.find(c => c.label === 'Mouse Constraint');
        if (mouse && savedMouse) {
            Matter.Composite.remove(world, savedMouse);
            mouse.bodyB = null;
            Matter.Composite.add(world, mouse);
        }

        const inspector = demo.tools.inspector;
        if (inspector && inspector.engine === engine) {
            Matter.Composite.remove(inspector.root, previous);
            Matter.Composite.add(inspector.root, world);
            world.parent = null; // The Inspector root is a view, not part of the saved world.
        }
    };

    MatterTools.Demo.start(demo, 'mixed');
};

export { demo };
