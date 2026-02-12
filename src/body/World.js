/**
* @deprecated Use `Matter.Composite` instead. This module is a thin re-export alias
* and will be removed in a future release.
*
* All usage should be migrated to the equivalent functions found on `Matter.Composite`.
* For example `World.add(world, body)` now becomes `Composite.add(world, body)`.
*
* The property `world.gravity` has been moved to `engine.gravity`.
*
* @class World
*/

import Composite from './Composite';

class World {
    /** @deprecated Use Composite.create instead. */
    static create = Composite.create;
    /** @deprecated Use Composite.add instead. */
    static add = Composite.add;
    /** @deprecated Use Composite.remove instead. */
    static remove = Composite.remove;
    /** @deprecated Use Composite.clear instead. */
    static clear = Composite.clear;
    /** @deprecated Use Composite.addComposite instead. */
    static addComposite = Composite.addComposite;
    /** @deprecated Use Composite.addBody instead. */
    static addBody = Composite.addBody;
    /** @deprecated Use Composite.addConstraint instead. */
    static addConstraint = Composite.addConstraint;
}

export default World;
