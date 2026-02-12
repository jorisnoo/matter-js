/**
* The `Matter.Common` module contains utility functions that are common to all modules.
*
* @class Common
*/

class Common {
    static _baseDelta = 1000 / 60;
    static _nextId = 0;
    static _seed = 0;
    static _warnedOnce = {};
    static _decomp = null;

    /**
     * The console logging level to use, where each level includes all levels above and excludes the levels below.
     * The default level is 'debug' which shows all console messages.
     *
     * Possible level values are:
     * - 0 = None
     * - 1 = Debug
     * - 2 = Info
     * - 3 = Warn
     * - 4 = Error
     * @static
     * @property logLevel
     * @type {Number}
     * @default 1
     */
    static logLevel = 1;

    /**
     * Extends the object in the first argument using the object in the second argument.
     * @method extend
     * @param {} obj
     * @param {boolean} deep
     * @return {} obj extended
     */
    static extend(obj, deep, ...rest) {
        let sources,
            deepClone;

        if (typeof deep === 'boolean') {
            deepClone = deep;
            sources = rest;
        } else {
            deepClone = true;
            sources = [deep, ...rest];
        }

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];

            if (source) {
                for (const prop in source) {
                    if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }

        return obj;
    }

    /**
     * Creates a new clone of the object, if deep is true references will also be cloned.
     * @method clone
     * @param {} obj
     * @param {bool} deep
     * @return {} obj cloned
     */
    static clone(obj, deep) {
        return Common.extend({}, deep, obj);
    }

    /**
     * Gets a value from `base` relative to the `path` string.
     * @method get
     * @param {} obj The base object
     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'
     * @param {number} [begin] Path slice begin
     * @param {number} [end] Path slice end
     * @return {} The object at the given path
     */
    static get(obj, path, begin, end) {
        path = path.split('.').slice(begin, end);

        for (let i = 0; i < path.length; i += 1) {
            obj = obj[path[i]];
        }

        return obj;
    }

    /**
     * Sets a value on `base` relative to the given `path` string.
     * @method set
     * @param {} obj The base object
     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'
     * @param {} val The value to set
     * @param {number} [begin] Path slice begin
     * @param {number} [end] Path slice end
     * @return {} Pass through `val` for chaining
     */
    static set(obj, path, val, begin, end) {
        const parts = path.split('.').slice(begin, end);
        Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
        return val;
    }

    /**
     * Shuffles the given array in-place.
     * The function uses a seeded random generator.
     * @method shuffle
     * @param {array} array
     * @return {array} array shuffled randomly
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Common.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    /**
     * Randomly chooses a value from a list with equal probability.
     * The function uses a seeded random generator.
     * @method choose
     * @param {array} choices
     * @return {object} A random choice object from the array
     */
    static choose(choices) {
        return choices[Math.floor(Common.random() * choices.length)];
    }

    /**
     * Returns true if the object is a HTMLElement, otherwise false.
     * @method isElement
     * @param {object} obj
     * @return {boolean} True if the object is a HTMLElement, otherwise false
     */
    static isElement(obj) {
        if (typeof HTMLElement !== 'undefined') {
            return obj instanceof HTMLElement;
        }

        return !!(obj && obj.nodeType && obj.nodeName);
    }

    /**
     * Returns the given value clamped between a minimum and maximum value.
     * @method clamp
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @return {number} The value clamped between min and max inclusive
     */
    static clamp(value, min, max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    }

    /**
     * Returns the sign of the given value.
     * @method sign
     * @param {number} value
     * @return {number} -1 if negative, +1 if 0 or positive
     */
    static sign(value) {
        return value < 0 ? -1 : 1;
    }

    /**
     * Returns the current timestamp since the time origin (e.g. from page load).
     * The result is in milliseconds and will use high-resolution timing if available.
     * @method now
     * @return {number} the current timestamp in milliseconds
     */
    static now() {
        if (typeof performance !== 'undefined' && performance.now) {
            return performance.now();
        }

        return Date.now();
    }

    /**
     * Returns a random value between a minimum and a maximum value inclusive.
     * The function uses a seeded random generator.
     * @method random
     * @param {number} min
     * @param {number} max
     * @return {number} A random number between min and max inclusive
     */
    static random(min = 0, max = 1) {
        return min + Common._seededRandom() * (max - min);
    }

    static _seededRandom() {
        // https://en.wikipedia.org/wiki/Linear_congruential_generator
        Common._seed = (Common._seed * 9301 + 49297) % 233280;
        return Common._seed / 233280;
    }

    /**
     * Shows a `console.log` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method log
     * @param ...objs {} The objects to log.
     */
    static log(...args) {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.log('matter-js:', ...args);
        }
    }

    /**
     * Shows a `console.info` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method info
     * @param ...objs {} The objects to log.
     */
    static info(...args) {
        if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
            console.info('matter-js:', ...args);
        }
    }

    /**
     * Shows a `console.warn` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method warn
     * @param ...objs {} The objects to log.
     */
    static warn(...args) {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.warn('matter-js:', ...args);
        }
    }

    /**
     * Uses `Common.warn` to log the given message one time only.
     * @method warnOnce
     * @param ...objs {} The objects to log.
     */
    static warnOnce(...args) {
        const message = args.join(' ');

        if (!Common._warnedOnce[message]) {
            Common.warn(message);
            Common._warnedOnce[message] = true;
        }
    }

    /**
     * Shows a deprecated console warning when the function on the given object is called.
     * The target function will be replaced with a new function that first shows the warning
     * and then calls the original function.
     * @method deprecated
     * @param {object} obj The object or module
     * @param {string} name The property name of the function on obj
     * @param {string} warning The one-time message to show if the function is called
     */
    static deprecated(obj, prop, warning) {
        obj[prop] = Common.chain(function() {
            Common.warnOnce('🔅 deprecated 🔅', warning);
        }, obj[prop]);
    }

    /**
     * Returns the next unique sequential ID.
     * @method nextId
     * @return {Number} Unique sequential ID
     */
    static nextId() {
        return Common._nextId++;
    }

    /**
     * Takes a directed graph and returns the partially ordered set of vertices in topological order.
     * Circular dependencies are allowed.
     * @method topologicalSort
     * @param {object} graph
     * @return {array} Partially ordered set of vertices in topological order.
     */
    static topologicalSort(graph) {
        // https://github.com/mgechev/javascript-algorithms
        // Copyright (c) Minko Gechev (MIT license)
        // Modifications: tidy formatting and naming
        const result = [],
            visited = [],
            temp = [];

        for (const node in graph) {
            if (!visited[node] && !temp[node]) {
                Common._topologicalSort(node, visited, temp, graph, result);
            }
        }

        return result;
    }

    static _topologicalSort(node, visited, temp, graph, result) {
        const neighbors = graph[node] || [];
        temp[node] = true;

        for (let i = 0; i < neighbors.length; i += 1) {
            const neighbor = neighbors[i];

            if (temp[neighbor]) {
                // skip circular dependencies
                continue;
            }

            if (!visited[neighbor]) {
                Common._topologicalSort(neighbor, visited, temp, graph, result);
            }
        }

        temp[node] = false;
        visited[node] = true;

        result.push(node);
    }

    /**
     * Takes _n_ functions as arguments and returns a new function that calls them in order.
     * The arguments applied when calling the new function will also be applied to every function passed.
     * The value of `this` refers to the last value returned in the chain that was not `undefined`.
     * Therefore if a passed function does not return a value, the previously returned value is maintained.
     * After all passed functions have been called the new function returns the last returned value (if any).
     * If any of the passed functions are a chain, then the chain will be flattened.
     * @method chain
     * @param ...funcs {function} The functions to chain.
     * @return {function} A new function that calls the passed functions in order.
     */
    static chain(...chainArgs) {
        const funcs = [];

        for (let i = 0; i < chainArgs.length; i += 1) {
            const func = chainArgs[i];

            if (func._chained) {
                // flatten already chained functions
                funcs.push(...func._chained);
            } else {
                funcs.push(func);
            }
        }

        const chain = function(...args) {
            let lastResult;

            for (let i = 0; i < funcs.length; i += 1) {
                const result = funcs[i].apply(lastResult, args);

                if (typeof result !== 'undefined') {
                    lastResult = result;
                }
            }

            return lastResult;
        };

        chain._chained = funcs;

        return chain;
    }

    /**
     * Chains a function to excute before the original function on the given `path` relative to `base`.
     * See also docs for `Common.chain`.
     * @method chainPathBefore
     * @param {} base The base object
     * @param {string} path The path relative to `base`
     * @param {function} func The function to chain before the original
     * @return {function} The chained function that replaced the original
     */
    static chainPathBefore(base, path, func) {
        return Common.set(base, path, Common.chain(
            func,
            Common.get(base, path)
        ));
    }

    /**
     * Chains a function to excute after the original function on the given `path` relative to `base`.
     * See also docs for `Common.chain`.
     * @method chainPathAfter
     * @param {} base The base object
     * @param {string} path The path relative to `base`
     * @param {function} func The function to chain after the original
     * @return {function} The chained function that replaced the original
     */
    static chainPathAfter(base, path, func) {
        return Common.set(base, path, Common.chain(
            Common.get(base, path),
            func
        ));
    }

    /**
     * Provide the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module to enable
     * concave vertex decomposition support when using `Bodies.fromVertices` e.g. `Common.setDecomp(require('poly-decomp'))`.
     * @method setDecomp
     * @param {} decomp The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module.
     */
    static setDecomp(decomp) {
        Common._decomp = decomp;
    }

    /**
     * Returns the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module provided through `Common.setDecomp`,
     * otherwise returns the global `decomp` if set.
     * @method getDecomp
     * @return {} The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module if provided.
     */
    static getDecomp() {
        // get user provided decomp if set
        let decomp = Common._decomp;

        try {
            // otherwise from window global
            if (!decomp && typeof window !== 'undefined') {
                decomp = window.decomp;
            }

            // otherwise from node global
            if (!decomp && typeof global !== 'undefined') {
                decomp = global.decomp;
            }
        } catch (e) {
            // decomp not available
            decomp = null;
        }

        return decomp;
    }
}

export default Common;
