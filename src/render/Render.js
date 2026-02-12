/**
* The `Matter.Render` module is a lightweight, optional utility which provides a simple canvas based renderer for visualising instances of `Matter.Engine`.
* It is intended for development and debugging purposes, but may also be suitable for simple games.
* It includes a number of drawing options including wireframe, vector with support for sprites and viewports.
*
* @class Render
*/

import Body from '../body/Body';
import Common from '../core/Common';
import Composite from '../body/Composite';
import Bounds from '../geometry/Bounds';
import Events from '../core/Events';
import Vector from '../geometry/Vector';
import Mouse from '../core/Mouse';

let _requestAnimationFrame,
    _cancelAnimationFrame;

if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                  || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
                                  || ((callback) => { window.setTimeout(() => { callback(Common.now()); }, 1000 / 60); });

    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
                                  || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
}

class Render {
    static _goodFps = 30;
    static _goodDelta = 1000 / 60;

    /**
     * Creates a new renderer. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {object} [options]
     * @return {render} A new renderer
     */
    constructor(options = {}) {
        const defaults = {
            engine: null,
            element: null,
            canvas: null,
            mouse: null,
            frameRequestId: null,
            timing: {
                historySize: 60,
                delta: 0,
                deltaHistory: [],
                lastTime: 0,
                lastTimestamp: 0,
                lastElapsed: 0,
                timestampElapsed: 0,
                timestampElapsedHistory: [],
                engineDeltaHistory: [],
                engineElapsedHistory: [],
                engineUpdatesHistory: [],
                elapsedHistory: []
            },
            options: {
                width: 800,
                height: 600,
                pixelRatio: 1,
                background: '#14151f',
                wireframeBackground: '#14151f',
                wireframeStrokeStyle: '#bbb',
                hasBounds: !!options.bounds,
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showStats: false,
                showPerformance: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showSeparations: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showVertexNumbers: false,
                showConvexHulls: false,
                showInternalEdges: false,
                showMousePosition: false
            }
        };

        Object.assign(this, Common.extend(defaults, options));

        if (this.canvas) {
            this.canvas.width = this.options.width || this.canvas.width;
            this.canvas.height = this.options.height || this.canvas.height;
        }

        this.mouse = options.mouse;
        this.engine = options.engine;
        this.canvas = this.canvas || Render._createCanvas(this.options.width, this.options.height);
        this.context = this.canvas.getContext('2d');
        this.textures = {};

        this.bounds = this.bounds || {
            min: {
                x: 0,
                y: 0
            },
            max: {
                x: this.canvas.width,
                y: this.canvas.height
            }
        };

        if (this.options.pixelRatio !== 1) {
            Render.setPixelRatio(this, this.options.pixelRatio);
        }

        if (Common.isElement(this.element)) {
            this.element.appendChild(this.canvas);
        }
    }

    /**
     * Creates a new renderer. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {object} [options]
     * @return {render} A new renderer
     */
    static create(options) {
        return new Render(options);
    }

    /**
     * Continuously updates the render canvas on the `requestAnimationFrame` event.
     * @method run
     * @param {render} render
     */
    static run(render) {
        (function loop(time){
            render.frameRequestId = _requestAnimationFrame(loop);

            Render._updateTiming(render, time);

            Render.world(render, time);

            render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);

            if (render.options.showStats || render.options.showDebug) {
                Render.stats(render, render.context, time);
            }

            if (render.options.showPerformance || render.options.showDebug) {
                Render.performance(render, render.context, time);
            }

            render.context.setTransform(1, 0, 0, 1, 0, 0);
        })();
    }

    /**
     * Ends execution of `Render.run` on the given `render`, by canceling the animation frame request event loop.
     * @method stop
     * @param {render} render
     */
    static stop(render) {
        _cancelAnimationFrame(render.frameRequestId);
    }

    /**
     * Sets the pixel ratio of the renderer and updates the canvas.
     * To automatically detect the correct ratio, pass the string `'auto'` for `pixelRatio`.
     * @method setPixelRatio
     * @param {render} render
     * @param {number} pixelRatio
     */
    static setPixelRatio(render, pixelRatio) {
        const options = render.options,
            canvas = render.canvas;

        if (pixelRatio === 'auto') {
            pixelRatio = Render._getPixelRatio(canvas);
        }

        options.pixelRatio = pixelRatio;
        canvas.setAttribute('data-pixel-ratio', pixelRatio);
        canvas.width = options.width * pixelRatio;
        canvas.height = options.height * pixelRatio;
        canvas.style.width = `${options.width}px`;
        canvas.style.height = `${options.height}px`;
    }

    /**
     * Sets the render `width` and `height`.
     *
     * Updates the canvas accounting for `render.options.pixelRatio`.
     *
     * Updates the bottom right render bound `render.bounds.max` relative to the provided `width` and `height`.
     * The top left render bound `render.bounds.min` isn't changed.
     *
     * Follow this call with `Render.lookAt` if you need to change the render bounds.
     *
     * See also `Render.setPixelRatio`.
     * @method setSize
     * @param {render} render
     * @param {number} width The width (in CSS pixels)
     * @param {number} height The height (in CSS pixels)
     */
    static setSize(render, width, height) {
        render.options.width = width;
        render.options.height = height;
        render.bounds.max.x = render.bounds.min.x + width;
        render.bounds.max.y = render.bounds.min.y + height;

        if (render.options.pixelRatio !== 1) {
            Render.setPixelRatio(render, render.options.pixelRatio);
        } else {
            render.canvas.width = width;
            render.canvas.height = height;
        }
    }

    /**
     * Positions and sizes the viewport around the given object bounds.
     * Objects must have at least one of the following properties:
     * - `object.bounds`
     * - `object.position`
     * - `object.min` and `object.max`
     * - `object.x` and `object.y`
     * @method lookAt
     * @param {render} render
     * @param {object[]} objects
     * @param {vector} [padding]
     * @param {bool} [center=true]
     */
    static lookAt(render, objects, padding, center = true) {
        objects = Array.isArray(objects) ? objects : [objects];
        padding = padding || {
            x: 0,
            y: 0
        };

        // find bounds of all objects
        const bounds = {
            min: { x: Infinity, y: Infinity },
            max: { x: -Infinity, y: -Infinity }
        };

        for (let i = 0; i < objects.length; i += 1) {
            const object = objects[i],
                min = object.bounds ? object.bounds.min : (object.min || object.position || object),
                max = object.bounds ? object.bounds.max : (object.max || object.position || object);

            if (min && max) {
                if (min.x < bounds.min.x)
                    bounds.min.x = min.x;

                if (max.x > bounds.max.x)
                    bounds.max.x = max.x;

                if (min.y < bounds.min.y)
                    bounds.min.y = min.y;

                if (max.y > bounds.max.y)
                    bounds.max.y = max.y;
            }
        }

        // find ratios
        const width = (bounds.max.x - bounds.min.x) + 2 * padding.x,
            height = (bounds.max.y - bounds.min.y) + 2 * padding.y,
            viewHeight = render.canvas.height,
            viewWidth = render.canvas.width,
            outerRatio = viewWidth / viewHeight,
            innerRatio = width / height;
        let scaleX = 1,
            scaleY = 1;

        // find scale factor
        if (innerRatio > outerRatio) {
            scaleY = innerRatio / outerRatio;
        } else {
            scaleX = outerRatio / innerRatio;
        }

        // enable bounds
        render.options.hasBounds = true;

        // position and size
        render.bounds.min.x = bounds.min.x;
        render.bounds.max.x = bounds.min.x + width * scaleX;
        render.bounds.min.y = bounds.min.y;
        render.bounds.max.y = bounds.min.y + height * scaleY;

        // center
        if (center) {
            render.bounds.min.x += width * 0.5 - (width * scaleX) * 0.5;
            render.bounds.max.x += width * 0.5 - (width * scaleX) * 0.5;
            render.bounds.min.y += height * 0.5 - (height * scaleY) * 0.5;
            render.bounds.max.y += height * 0.5 - (height * scaleY) * 0.5;
        }

        // padding
        render.bounds.min.x -= padding.x;
        render.bounds.max.x -= padding.x;
        render.bounds.min.y -= padding.y;
        render.bounds.max.y -= padding.y;

        // update mouse
        if (render.mouse) {
            Mouse.setScale(render.mouse, {
                x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,
                y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height
            });

            Mouse.setOffset(render.mouse, render.bounds.min);
        }
    }

    /**
     * Applies viewport transforms based on `render.bounds` to a render context.
     * @method startViewTransform
     * @param {render} render
     */
    static startViewTransform(render) {
        const boundsWidth = render.bounds.max.x - render.bounds.min.x,
            boundsHeight = render.bounds.max.y - render.bounds.min.y,
            boundsScaleX = boundsWidth / render.options.width,
            boundsScaleY = boundsHeight / render.options.height;

        render.context.setTransform(
            render.options.pixelRatio / boundsScaleX, 0, 0,
            render.options.pixelRatio / boundsScaleY, 0, 0
        );

        render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
    }

    /**
     * Resets all transforms on the render context.
     * @method endViewTransform
     * @param {render} render
     */
    static endViewTransform(render) {
        render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
    }

    /**
     * Renders the given `engine`'s world composite.
     * This is the entry point for all rendering and should be called every time the scene changes.
     * @method world
     * @param {render} render
     */
    static world(render, time) {
        const startTime = Common.now(),
            engine = render.engine,
            world = engine.world,
            canvas = render.canvas,
            context = render.context,
            options = render.options,
            timing = render.timing;

        const allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world),
            background = options.wireframes ? options.wireframeBackground : options.background;
        let bodies = [],
            constraints = [],
            i;

        const event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(render, 'beforeRender', event);

        // apply background if it has changed
        if (render.currentBackground !== background)
            Render._applyBackground(render, background);

        // clear the canvas with a transparent fill, to allow the canvas background to show
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';

        // handle bounds
        if (options.hasBounds) {
            // filter out bodies that are not in view
            for (i = 0; i < allBodies.length; i++) {
                const body = allBodies[i];
                if (Bounds.overlaps(body.bounds, render.bounds))
                    bodies.push(body);
            }

            // filter out constraints that are not in view
            for (i = 0; i < allConstraints.length; i++) {
                const constraint = allConstraints[i],
                    bodyA = constraint.bodyA,
                    bodyB = constraint.bodyB;
                let pointAWorld = constraint.pointA,
                    pointBWorld = constraint.pointB;

                if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                if (!pointAWorld || !pointBWorld)
                    continue;

                if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                    constraints.push(constraint);
            }

            // transform the view
            Render.startViewTransform(render);

            // update mouse
            if (render.mouse) {
                Mouse.setScale(render.mouse, {
                    x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                    y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
                });

                Mouse.setOffset(render.mouse, render.bounds.min);
            }
        } else {
            constraints = allConstraints;
            bodies = allBodies;

            if (render.options.pixelRatio !== 1) {
                render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
            }
        }

        if (!options.wireframes || (engine.enableSleeping && options.showSleeping)) {
            // fully featured rendering of bodies
            Render.bodies(render, bodies, context);
        } else {
            if (options.showConvexHulls)
                Render.bodyConvexHulls(render, bodies, context);

            // optimised method for wireframes only
            Render.bodyWireframes(render, bodies, context);
        }

        if (options.showBounds)
            Render.bodyBounds(render, bodies, context);

        if (options.showAxes || options.showAngleIndicator)
            Render.bodyAxes(render, bodies, context);

        if (options.showPositions)
            Render.bodyPositions(render, bodies, context);

        if (options.showVelocity)
            Render.bodyVelocity(render, bodies, context);

        if (options.showIds)
            Render.bodyIds(render, bodies, context);

        if (options.showSeparations)
            Render.separations(render, engine.pairs.list, context);

        if (options.showCollisions)
            Render.collisions(render, engine.pairs.list, context);

        if (options.showVertexNumbers)
            Render.vertexNumbers(render, bodies, context);

        if (options.showMousePosition)
            Render.mousePosition(render, render.mouse, context);

        Render.constraints(constraints, context);

        if (options.hasBounds) {
            // revert view transforms
            Render.endViewTransform(render);
        }

        Events.trigger(render, 'afterRender', event);

        // log the time elapsed computing this update
        timing.lastElapsed = Common.now() - startTime;
    }

    /**
     * Renders statistics about the engine and world useful for debugging.
     * @private
     * @method stats
     * @param {render} render
     * @param {RenderingContext} context
     * @param {Number} time
     */
    static stats(render, context, time) {
        const engine = render.engine,
            world = engine.world,
            bodies = Composite.allBodies(world),
            width = 55,
            height = 44,
            y = 0;
        let parts = 0,
            x = 0;

        // count parts
        for (let i = 0; i < bodies.length; i += 1) {
            parts += bodies[i].parts.length;
        }

        // sections
        const sections = {
            'Part': parts,
            'Body': bodies.length,
            'Cons': Composite.allConstraints(world).length,
            'Comp': Composite.allComposites(world).length,
            'Pair': engine.pairs.list.length
        };

        // background
        context.fillStyle = '#0e0f19';
        context.fillRect(x, y, width * 5.5, height);

        context.font = '12px Arial';
        context.textBaseline = 'top';
        context.textAlign = 'right';

        // sections
        for (const key in sections) {
            const section = sections[key];
            // label
            context.fillStyle = '#aaa';
            context.fillText(key, x + width, y + 8);

            // value
            context.fillStyle = '#eee';
            context.fillText(section, x + width, y + 26);

            x += width;
        }
    }

    /**
     * Renders engine and render performance information.
     * @private
     * @method performance
     * @param {render} render
     * @param {RenderingContext} context
     */
    static performance(render, context) {
        const engine = render.engine,
            timing = render.timing,
            deltaHistory = timing.deltaHistory,
            elapsedHistory = timing.elapsedHistory,
            timestampElapsedHistory = timing.timestampElapsedHistory,
            engineDeltaHistory = timing.engineDeltaHistory,
            engineUpdatesHistory = timing.engineUpdatesHistory,
            engineElapsedHistory = timing.engineElapsedHistory,
            lastEngineUpdatesPerFrame = engine.timing.lastUpdatesPerFrame,
            lastEngineDelta = engine.timing.lastDelta;

        const deltaMean = Render._mean(deltaHistory),
            elapsedMean = Render._mean(elapsedHistory),
            engineDeltaMean = Render._mean(engineDeltaHistory),
            engineUpdatesMean = Render._mean(engineUpdatesHistory),
            engineElapsedMean = Render._mean(engineElapsedHistory),
            timestampElapsedMean = Render._mean(timestampElapsedHistory),
            rateMean = (timestampElapsedMean / deltaMean) || 0,
            neededUpdatesPerFrame = Math.round(deltaMean / lastEngineDelta),
            fps = (1000 / deltaMean) || 0;

        const graphHeight = 4,
            gap = 12,
            width = 60,
            height = 34,
            x = 10,
            y = 69;

        // background
        context.fillStyle = '#0e0f19';
        context.fillRect(0, 50, gap * 5 + width * 6 + 22, height);

        // show FPS
        Render.status(
            context, x, y, width, graphHeight, deltaHistory.length,
            `${Math.round(fps)} fps`,
            fps / Render._goodFps,
            (i) => (deltaHistory[i] / deltaMean) - 1
        );

        // show engine delta
        Render.status(
            context, x + gap + width, y, width, graphHeight, engineDeltaHistory.length,
            `${lastEngineDelta.toFixed(2)} dt`,
            Render._goodDelta / lastEngineDelta,
            (i) => (engineDeltaHistory[i] / engineDeltaMean) - 1
        );

        // show engine updates per frame
        Render.status(
            context, x + (gap + width) * 2, y, width, graphHeight, engineUpdatesHistory.length,
            `${lastEngineUpdatesPerFrame} upf`,
            Math.pow(Common.clamp((engineUpdatesMean / neededUpdatesPerFrame) || 1, 0, 1), 4),
            (i) => (engineUpdatesHistory[i] / engineUpdatesMean) - 1
        );

        // show engine update time
        Render.status(
            context, x + (gap + width) * 3, y, width, graphHeight, engineElapsedHistory.length,
            `${engineElapsedMean.toFixed(2)} ut`,
            1 - (lastEngineUpdatesPerFrame * engineElapsedMean / Render._goodFps),
            (i) => (engineElapsedHistory[i] / engineElapsedMean) - 1
        );

        // show render time
        Render.status(
            context, x + (gap + width) * 4, y, width, graphHeight, elapsedHistory.length,
            `${elapsedMean.toFixed(2)} rt`,
            1 - (elapsedMean / Render._goodFps),
            (i) => (elapsedHistory[i] / elapsedMean) - 1
        );

        // show effective speed
        Render.status(
            context, x + (gap + width) * 5, y, width, graphHeight, timestampElapsedHistory.length,
            `${rateMean.toFixed(2)} x`,
            rateMean * rateMean * rateMean,
            (i) => (((timestampElapsedHistory[i] / deltaHistory[i]) / rateMean) || 0) - 1
        );
    }

    /**
     * Renders a label, indicator and a chart.
     * @private
     * @method status
     * @param {RenderingContext} context
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} count
     * @param {string} label
     * @param {string} indicator
     * @param {function} plotY
     */
    static status(context, x, y, width, height, count, label, indicator, plotY) {
        // background
        context.strokeStyle = '#888';
        context.fillStyle = '#444';
        context.lineWidth = 1;
        context.fillRect(x, y + 7, width, 1);

        // chart
        context.beginPath();
        context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
        for (let i = 0; i < width; i += 1) {
            context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));
        }
        context.stroke();

        // indicator
        context.fillStyle = `hsl(${Common.clamp(25 + 95 * indicator, 0, 120)},100%,60%)`;
        context.fillRect(x, y - 7, 4, 4);

        // label
        context.font = '12px Arial';
        context.textBaseline = 'middle';
        context.textAlign = 'right';
        context.fillStyle = '#eee';
        context.fillText(label, x + width, y - 5);
    }

    /**
     * Description
     * @private
     * @method constraints
     * @param {constraint[]} constraints
     * @param {RenderingContext} context
     */
    static constraints(constraints, context) {
        const c = context;

        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];

            if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                continue;

            const bodyA = constraint.bodyA,
                bodyB = constraint.bodyB;
            let start,
                end;

            if (bodyA) {
                start = Vector.add(bodyA.position, constraint.pointA);
            } else {
                start = constraint.pointA;
            }

            if (constraint.render.type === 'pin') {
                c.beginPath();
                c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                c.closePath();
            } else {
                if (bodyB) {
                    end = Vector.add(bodyB.position, constraint.pointB);
                } else {
                    end = constraint.pointB;
                }

                c.beginPath();
                c.moveTo(start.x, start.y);

                if (constraint.render.type === 'spring') {
                    const delta = Vector.sub(end, start),
                        normal = Vector.perp(Vector.normalise(delta)),
                        coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20));
                    let offset;

                    for (let j = 1; j < coils; j += 1) {
                        offset = j % 2 === 0 ? 1 : -1;

                        c.lineTo(
                            start.x + delta.x * (j / coils) + normal.x * offset * 4,
                            start.y + delta.y * (j / coils) + normal.y * offset * 4
                        );
                    }
                }

                c.lineTo(end.x, end.y);
            }

            if (constraint.render.lineWidth) {
                c.lineWidth = constraint.render.lineWidth;
                c.strokeStyle = constraint.render.strokeStyle;
                c.stroke();
            }

            if (constraint.render.anchors) {
                c.fillStyle = constraint.render.strokeStyle;
                c.beginPath();
                c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
                c.closePath();
                c.fill();
            }
        }
    }

    /**
     * Description
     * @private
     * @method bodies
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodies(render, bodies, context) {
        const c = context,
            options = render.options,
            showInternalEdges = options.showInternalEdges || !options.wireframes;
        let body,
            part,
            i,
            k;

        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                part = body.parts[k];

                if (!part.render.visible)
                    continue;

                if (options.showSleeping && body.isSleeping) {
                    c.globalAlpha = 0.5 * part.render.opacity;
                } else if (part.render.opacity !== 1) {
                    c.globalAlpha = part.render.opacity;
                }

                if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                    // part sprite
                    const sprite = part.render.sprite,
                        texture = Render._getTexture(render, sprite.texture);

                    c.translate(part.position.x, part.position.y);
                    c.rotate(part.angle);

                    c.drawImage(
                        texture,
                        texture.width * -sprite.xOffset * sprite.xScale,
                        texture.height * -sprite.yOffset * sprite.yScale,
                        texture.width * sprite.xScale,
                        texture.height * sprite.yScale
                    );

                    // revert translation, hopefully faster than save / restore
                    c.rotate(-part.angle);
                    c.translate(-part.position.x, -part.position.y);
                } else {
                    // part polygon
                    if (part.circleRadius) {
                        c.beginPath();
                        c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                    } else {
                        c.beginPath();
                        c.moveTo(part.vertices[0].x, part.vertices[0].y);

                        for (let j = 1; j < part.vertices.length; j++) {
                            if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                                c.lineTo(part.vertices[j].x, part.vertices[j].y);
                            } else {
                                c.moveTo(part.vertices[j].x, part.vertices[j].y);
                            }

                            if (part.vertices[j].isInternal && !showInternalEdges) {
                                c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                            }
                        }

                        c.lineTo(part.vertices[0].x, part.vertices[0].y);
                        c.closePath();
                    }

                    if (!options.wireframes) {
                        c.fillStyle = part.render.fillStyle;

                        if (part.render.lineWidth) {
                            c.lineWidth = part.render.lineWidth;
                            c.strokeStyle = part.render.strokeStyle;
                            c.stroke();
                        }

                        c.fill();
                    } else {
                        c.lineWidth = 1;
                        c.strokeStyle = render.options.wireframeStrokeStyle;
                        c.stroke();
                    }
                }

                c.globalAlpha = 1;
            }
        }
    }

    /**
     * Optimised method for drawing body wireframes in one pass
     * @private
     * @method bodyWireframes
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyWireframes(render, bodies, context) {
        const c = context,
            showInternalEdges = render.options.showInternalEdges;
        let body,
            part,
            i,
            j,
            k;

        c.beginPath();

        // render all bodies
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                part = body.parts[k];

                c.moveTo(part.vertices[0].x, part.vertices[0].y);

                for (j = 1; j < part.vertices.length; j++) {
                    if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                        c.lineTo(part.vertices[j].x, part.vertices[j].y);
                    } else {
                        c.moveTo(part.vertices[j].x, part.vertices[j].y);
                    }

                    if (part.vertices[j].isInternal && !showInternalEdges) {
                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                    }
                }

                c.lineTo(part.vertices[0].x, part.vertices[0].y);
            }
        }

        c.lineWidth = 1;
        c.strokeStyle = render.options.wireframeStrokeStyle;
        c.stroke();
    }

    /**
     * Optimised method for drawing body convex hull wireframes in one pass
     * @private
     * @method bodyConvexHulls
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyConvexHulls(render, bodies, context) {
        const c = context;
        let body,
            i,
            j;

        c.beginPath();

        // render convex hulls
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible || body.parts.length === 1)
                continue;

            c.moveTo(body.vertices[0].x, body.vertices[0].y);

            for (j = 1; j < body.vertices.length; j++) {
                c.lineTo(body.vertices[j].x, body.vertices[j].y);
            }

            c.lineTo(body.vertices[0].x, body.vertices[0].y);
        }

        c.lineWidth = 1;
        c.strokeStyle = 'rgba(255,255,255,0.2)';
        c.stroke();
    }

    /**
     * Renders body vertex numbers.
     * @private
     * @method vertexNumbers
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static vertexNumbers(render, bodies, context) {
        const c = context;
        let i,
            j,
            k;

        for (i = 0; i < bodies.length; i++) {
            const parts = bodies[i].parts;
            for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                const part = parts[k];
                for (j = 0; j < part.vertices.length; j++) {
                    c.fillStyle = 'rgba(255,255,255,0.2)';
                    c.fillText(`${i}_${j}`, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                }
            }
        }
    }

    /**
     * Renders mouse position.
     * @private
     * @method mousePosition
     * @param {render} render
     * @param {mouse} mouse
     * @param {RenderingContext} context
     */
    static mousePosition(render, mouse, context) {
        const c = context;
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.fillText(`${mouse.position.x}  ${mouse.position.y}`, mouse.position.x + 5, mouse.position.y - 5);
    }

    /**
     * Draws body bounds
     * @private
     * @method bodyBounds
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyBounds(render, bodies, context) {
        const c = context,
            options = render.options;

        c.beginPath();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];

            if (body.render.visible) {
                const parts = bodies[i].parts;
                for (let j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    const part = parts[j];
                    c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                }
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,255,255,0.08)';
        } else {
            c.strokeStyle = 'rgba(0,0,0,0.1)';
        }

        c.lineWidth = 1;
        c.stroke();
    }

    /**
     * Draws body angle indicators and axes
     * @private
     * @method bodyAxes
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyAxes(render, bodies, context) {
        const c = context,
            options = render.options;
        let part,
            i,
            j,
            k;

        c.beginPath();

        for (i = 0; i < bodies.length; i++) {
            const body = bodies[i],
                parts = body.parts;

            if (!body.render.visible)
                continue;

            if (options.showAxes) {
                // render all axes
                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    part = parts[j];
                    for (k = 0; k < part.axes.length; k++) {
                        const axis = part.axes[k];
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                    }
                }
            } else {
                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    part = parts[j];
                    for (k = 0; k < part.axes.length; k++) {
                        // render a single axis indicator
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo((part.vertices[0].x + part.vertices[part.vertices.length-1].x) / 2,
                            (part.vertices[0].y + part.vertices[part.vertices.length-1].y) / 2);
                    }
                }
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'indianred';
            c.lineWidth = 1;
        } else {
            c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            c.globalCompositeOperation = 'overlay';
            c.lineWidth = 2;
        }

        c.stroke();
        c.globalCompositeOperation = 'source-over';
    }

    /**
     * Draws body positions
     * @private
     * @method bodyPositions
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyPositions(render, bodies, context) {
        const c = context,
            options = render.options;
        let body,
            part,
            i,
            k;

        c.beginPath();

        // render current positions
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = 0; k < body.parts.length; k++) {
                part = body.parts[k];
                c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                c.closePath();
            }
        }

        if (options.wireframes) {
            c.fillStyle = 'indianred';
        } else {
            c.fillStyle = 'rgba(0,0,0,0.5)';
        }
        c.fill();

        c.beginPath();

        // render previous positions
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];
            if (body.render.visible) {
                c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                c.closePath();
            }
        }

        c.fillStyle = 'rgba(255,165,0,0.8)';
        c.fill();
    }

    /**
     * Draws body velocity
     * @private
     * @method bodyVelocity
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyVelocity(render, bodies, context) {
        const c = context;

        c.beginPath();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];

            if (!body.render.visible)
                continue;

            const velocity = Body.getVelocity(body);

            c.moveTo(body.position.x, body.position.y);
            c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);
        }

        c.lineWidth = 3;
        c.strokeStyle = 'cornflowerblue';
        c.stroke();
    }

    /**
     * Draws body ids
     * @private
     * @method bodyIds
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    static bodyIds(render, bodies, context) {
        const c = context;
        let i,
            j;

        for (i = 0; i < bodies.length; i++) {
            if (!bodies[i].render.visible)
                continue;

            const parts = bodies[i].parts;
            for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                const part = parts[j];
                c.font = "12px Arial";
                c.fillStyle = 'rgba(255,255,255,0.5)';
                c.fillText(part.id, part.position.x + 10, part.position.y - 10);
            }
        }
    }

    /**
     * Description
     * @private
     * @method collisions
     * @param {render} render
     * @param {pair[]} pairs
     * @param {RenderingContext} context
     */
    static collisions(render, pairs, context) {
        const c = context,
            options = render.options;
        let pair,
            collision,
            i,
            j;

        c.beginPath();

        // render collision positions
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;
            for (j = 0; j < pair.contactCount; j++) {
                const contact = pair.contacts[j],
                    vertex = contact.vertex;
                c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
            }
        }

        if (options.wireframes) {
            c.fillStyle = 'rgba(255,255,255,0.7)';
        } else {
            c.fillStyle = 'orange';
        }
        c.fill();

        c.beginPath();

        // render collision normals
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;

            if (pair.contactCount > 0) {
                let normalPosX = pair.contacts[0].vertex.x,
                    normalPosY = pair.contacts[0].vertex.y;

                if (pair.contactCount === 2) {
                    normalPosX = (pair.contacts[0].vertex.x + pair.contacts[1].vertex.x) / 2;
                    normalPosY = (pair.contacts[0].vertex.y + pair.contacts[1].vertex.y) / 2;
                }

                if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                    c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                } else {
                    c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                }

                c.lineTo(normalPosX, normalPosY);
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,165,0,0.7)';
        } else {
            c.strokeStyle = 'orange';
        }

        c.lineWidth = 1;
        c.stroke();
    }

    /**
     * Description
     * @private
     * @method separations
     * @param {render} render
     * @param {pair[]} pairs
     * @param {RenderingContext} context
     */
    static separations(render, pairs, context) {
        const c = context,
            options = render.options;
        let pair,
            collision,
            bodyA,
            bodyB,
            i;

        c.beginPath();

        // render separations
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;

            let k = 1;

            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
            if (bodyB.isStatic) k = 0;

            c.moveTo(bodyB.position.x, bodyB.position.y);
            c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);

            k = 1;

            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
            if (bodyA.isStatic) k = 0;

            c.moveTo(bodyA.position.x, bodyA.position.y);
            c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,165,0,0.5)';
        } else {
            c.strokeStyle = 'orange';
        }
        c.stroke();
    }

    /**
     * Description
     * @private
     * @method inspector
     * @param {inspector} inspector
     * @param {RenderingContext} context
     */
    static inspector(inspector, context) {
        const selected = inspector.selected,
            render = inspector.render,
            options = render.options;
        let bounds;

        if (options.hasBounds) {
            const boundsWidth = render.bounds.max.x - render.bounds.min.x,
                boundsHeight = render.bounds.max.y - render.bounds.min.y,
                boundsScaleX = boundsWidth / render.options.width,
                boundsScaleY = boundsHeight / render.options.height;

            context.scale(1 / boundsScaleX, 1 / boundsScaleY);
            context.translate(-render.bounds.min.x, -render.bounds.min.y);
        }

        for (let i = 0; i < selected.length; i++) {
            const item = selected[i].data;

            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,165,0,0.9)';
            context.setLineDash([1,2]);

            switch (item.type) {

            case 'body':

                // render body selections
                bounds = item.bounds;
                context.beginPath();
                context.rect(Math.floor(bounds.min.x - 3), Math.floor(bounds.min.y - 3),
                    Math.floor(bounds.max.x - bounds.min.x + 6), Math.floor(bounds.max.y - bounds.min.y + 6));
                context.closePath();
                context.stroke();

                break;

            case 'constraint': {

                // render constraint selections
                let point = item.pointA;
                if (item.bodyA)
                    point = item.pointB;
                context.beginPath();
                context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                context.closePath();
                context.stroke();

                break;
            }

            }

            context.setLineDash([]);
            context.translate(-0.5, -0.5);
        }

        // render selection region
        if (inspector.selectStart !== null) {
            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,165,0,0.6)';
            context.fillStyle = 'rgba(255,165,0,0.1)';
            bounds = inspector.selectBounds;
            context.beginPath();
            context.rect(Math.floor(bounds.min.x), Math.floor(bounds.min.y),
                Math.floor(bounds.max.x - bounds.min.x), Math.floor(bounds.max.y - bounds.min.y));
            context.closePath();
            context.stroke();
            context.fill();
            context.translate(-0.5, -0.5);
        }

        if (options.hasBounds)
            context.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * Updates render timing.
     * @method _updateTiming
     * @private
     * @param {render} render
     * @param {number} time
     */
    static _updateTiming(render, time) {
        const engine = render.engine,
            timing = render.timing,
            historySize = timing.historySize,
            timestamp = engine.timing.timestamp;

        timing.delta = time - timing.lastTime || Render._goodDelta;
        timing.lastTime = time;

        timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
        timing.lastTimestamp = timestamp;

        timing.deltaHistory.unshift(timing.delta);
        timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);

        timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
        timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);

        timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
        timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);

        timing.engineUpdatesHistory.unshift(engine.timing.lastUpdatesPerFrame);
        timing.engineUpdatesHistory.length = Math.min(timing.engineUpdatesHistory.length, historySize);

        timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
        timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);

        timing.elapsedHistory.unshift(timing.lastElapsed);
        timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
    }

    /**
     * Returns the mean value of the given numbers.
     * @method _mean
     * @private
     * @param {Number[]} values
     * @return {Number} the mean of given values
     */
    static _mean(values) {
        let result = 0;
        for (let i = 0; i < values.length; i += 1) {
            result += values[i];
        }
        return (result / values.length) || 0;
    }

    /**
     * @method _createCanvas
     * @private
     * @param {} width
     * @param {} height
     * @return canvas
     */
    static _createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.oncontextmenu = () => false;
        canvas.onselectstart = () => false;
        return canvas;
    }

    /**
     * Gets the pixel ratio of the canvas.
     * @method _getPixelRatio
     * @private
     * @param {HTMLElement} canvas
     * @return {Number} pixel ratio
     */
    static _getPixelRatio(canvas) {
        const context = canvas.getContext('2d'),
            devicePixelRatio = window.devicePixelRatio || 1,
            backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio
                                      || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio
                                      || context.backingStorePixelRatio || 1;

        return devicePixelRatio / backingStorePixelRatio;
    }

    /**
     * Gets the requested texture (an Image) via its path
     * @method _getTexture
     * @private
     * @param {render} render
     * @param {string} imagePath
     * @return {Image} texture
     */
    static _getTexture(render, imagePath) {
        let image = render.textures[imagePath];

        if (image)
            return image;

        image = render.textures[imagePath] = new Image();
        image.src = imagePath;

        return image;
    }

    /**
     * Applies the background to the canvas using CSS.
     * @method applyBackground
     * @private
     * @param {render} render
     * @param {string} background
     */
    static _applyBackground(render, background) {
        let cssBackground = background;

        if (/(jpg|gif|png)$/.test(background))
            cssBackground = `url(${background})`;

        render.canvas.style.background = cssBackground;
        render.canvas.style.backgroundSize = "contain";
        render.currentBackground = background;
    }
}

/*
*
*  Events Documentation
*
*/

/**
* Fired before rendering
*
* @event beforeRender
* @param {} event An event object
* @param {number} event.timestamp The engine.timing.timestamp of the event
* @param {} event.source The source object of the event
* @param {} event.name The name of the event
*/

/**
* Fired after rendering
*
* @event afterRender
* @param {} event An event object
* @param {number} event.timestamp The engine.timing.timestamp of the event
* @param {} event.source The source object of the event
* @param {} event.name The name of the event
*/

/*
*
*  Properties Documentation
*
*/

/**
 * A reference to the `Matter.Engine` instance to be used.
 *
 * @property engine
 * @type engine
 */

/**
 * A reference to the element where the canvas is to be inserted (if `render.canvas` has not been specified)
 *
 * @property element
 * @type HTMLElement
 * @default null
 */

/**
 * The canvas element to render to. If not specified, one will be created if `render.element` has been specified.
 *
 * @property canvas
 * @type HTMLCanvasElement
 * @default null
 */

/**
 * A `Bounds` object that specifies the drawing view region.
 * Rendering will be automatically transformed and scaled to fit within the canvas size (`render.options.width` and `render.options.height`).
 * This allows for creating views that can pan or zoom around the scene.
 * You must also set `render.options.hasBounds` to `true` to enable bounded rendering.
 *
 * @property bounds
 * @type bounds
 */

/**
 * The 2d rendering context from the `render.canvas` element.
 *
 * @property context
 * @type CanvasRenderingContext2D
 */

/**
 * The sprite texture cache.
 *
 * @property textures
 * @type {}
 */

/**
 * The mouse to render if `render.options.showMousePosition` is enabled.
 *
 * @property mouse
 * @type mouse
 * @default null
 */

/**
 * The configuration options of the renderer.
 *
 * @property options
 * @type {}
 */

/**
 * The target width in pixels of the `render.canvas` to be created.
 * See also the `options.pixelRatio` property to change render quality.
 *
 * @property options.width
 * @type number
 * @default 800
 */

/**
 * The target height in pixels of the `render.canvas` to be created.
 * See also the `options.pixelRatio` property to change render quality.
 *
 * @property options.height
 * @type number
 * @default 600
 */

/**
 * The [pixel ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) to use when rendering.
 *
 * @property options.pixelRatio
 * @type number
 * @default 1
 */

/**
 * A CSS background color string to use when `render.options.wireframes` is disabled.
 * This may be also set to `'transparent'` or equivalent.
 *
 * @property options.background
 * @type string
 * @default '#14151f'
 */

/**
 * A CSS color string to use for background when `render.options.wireframes` is enabled.
 * This may be also set to `'transparent'` or equivalent.
 *
 * @property options.wireframeBackground
 * @type string
 * @default '#14151f'
 */

/**
 * A CSS color string to use for stroke when `render.options.wireframes` is enabled.
 * This may be also set to `'transparent'` or equivalent.
 *
 * @property options.wireframeStrokeStyle
 * @type string
 * @default '#bbb'
 */

/**
 * A flag that specifies if `render.bounds` should be used when rendering.
 *
 * @property options.hasBounds
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable all debug information overlays together.
 * This includes and has priority over the values of:
 *
 * - `render.options.showStats`
 * - `render.options.showPerformance`
 *
 * @property options.showDebug
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the engine stats info overlay.
 * From left to right, the values shown are:
 *
 * - body parts total
 * - body total
 * - constraints total
 * - composites total
 * - collision pairs total
 *
 * @property options.showStats
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable performance charts.
 * From left to right, the values shown are:
 *
 * - average render frequency (e.g. 60 fps)
 * - exact engine delta time used for last update (e.g. 16.66ms)
 * - average updates per frame (e.g. 1)
 * - average engine execution duration (e.g. 5.00ms)
 * - average render execution duration (e.g. 0.40ms)
 * - average effective play speed (e.g. '1.00x' is 'real-time')
 *
 * Each value is recorded over a fixed sample of past frames (60 frames).
 *
 * A chart shown below each value indicates the variance from the average over the sample.
 * The more stable or fixed the value is the flatter the chart will appear.
 *
 * @property options.showPerformance
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable rendering entirely.
 *
 * @property options.enabled
 * @type boolean
 * @default false
 */

/**
 * A flag to toggle wireframe rendering otherwise solid fill rendering is used.
 *
 * @property options.wireframes
 * @type boolean
 * @default true
 */

/**
 * A flag to enable or disable sleeping bodies indicators.
 *
 * @property options.showSleeping
 * @type boolean
 * @default true
 */

/**
 * A flag to enable or disable the debug information overlay.
 *
 * @property options.showDebug
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body bounds debug overlay.
 *
 * @property options.showBounds
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body velocity debug overlay.
 *
 * @property options.showVelocity
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body collisions debug overlay.
 *
 * @property options.showCollisions
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the collision resolver separations debug overlay.
 *
 * @property options.showSeparations
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body axes debug overlay.
 *
 * @property options.showAxes
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body positions debug overlay.
 *
 * @property options.showPositions
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body angle debug overlay.
 *
 * @property options.showAngleIndicator
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body and part ids debug overlay.
 *
 * @property options.showIds
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body vertex numbers debug overlay.
 *
 * @property options.showVertexNumbers
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body convex hulls debug overlay.
 *
 * @property options.showConvexHulls
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the body internal edges debug overlay.
 *
 * @property options.showInternalEdges
 * @type boolean
 * @default false
 */

/**
 * A flag to enable or disable the mouse position debug overlay.
 *
 * @property options.showMousePosition
 * @type boolean
 * @default false
 */

export default Render;
