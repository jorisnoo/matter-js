/**
* This module has now been replaced by `Matter.Composite`.
*
* All usage should be migrated to the equivalent functions found on `Matter.Composite`.
* For example `World.add(world, body)` now becomes `Composite.add(world, body)`.
*
* The property `world.gravity` has been moved to `engine.gravity`.
*
* For back-compatibility purposes this module will remain as a direct alias to `Matter.Composite` in the short term during migration.
* Eventually this alias module will be marked as deprecated and then later removed in a future release.
*
* @class World
*/

import Composite from './Composite';

/**
 * See above, aliases for back compatibility only
 */
class World {
    static create = Composite.create;
    static add = Composite.add;
    static remove = Composite.remove;
    static clear = Composite.clear;
    static addComposite = Composite.addComposite;
    static addBody = Composite.addBody;
    static addConstraint = Composite.addConstraint;
}

export default World;
