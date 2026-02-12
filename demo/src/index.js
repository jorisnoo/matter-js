/**
* Initialise and start the browser demo / compare tool.
*
* For a simpler, minimal Matter.js example see:
* https://github.com/liabru/matter-js/wiki/Getting-started
*
* The source for examples can be found at `/examples/`.
*
* @module Index
*/

import Matter from 'matter-js';
import * as Examples from '../../examples/index.js';
import { compare } from './Compare.js';
import { multi } from './Multi.js';
import { demo } from './Demo.js';
import pathseg from 'pathseg';
import MatterTools from 'matter-tools';

// browser globals
window.pathseg = pathseg;
window.MatterTools = MatterTools;
window.Matter = Matter;

// prepare examples
const examples = Object.keys(Examples).map((id) => {
    return {
        id: id,
        sourceLink: `https://github.com/liabru/matter-js/blob/master/examples/${id}.js`,
        name: Examples[id].title,
        init: Examples[id]
    };
});

// start the requested tool
const isCompare = window.location.search.indexOf('compare') >= 0;
const isMulti = window.location.search.indexOf('multi') >= 0;
const isDev = __MATTER_IS_DEV__;

if (isCompare) {
    compare(examples, isDev);
} else if (isMulti) {
    multi(examples, isDev);
} else {
    demo(examples, isDev);
}
