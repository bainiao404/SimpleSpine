import type { Updatable } from './Updatable';
import type { TransformConstraintData } from './TransformConstraintData';
import type { Bone } from './Bone';
import { Vector2 } from '@pixi-spine/base';
import type { Skeleton } from './Skeleton';
/** Stores the current pose for a transform constraint. A transform constraint adjusts the world transform of the constrained
 * bones to match that of the target bone.
 *
 * See [Transform constraints](http://esotericsoftware.com/spine-transform-constraints) in the Spine User Guide.
 * @public
 * */
export declare class TransformConstraint implements Updatable {
    /** The transform constraint's setup pose data. */
    data: TransformConstraintData;
    /** The bones that will be modified by this transform constraint. */
    bones: Array<Bone>;
    /** The target bone whose world transform will be copied to the constrained bones. */
    target: Bone;
    mixRotate: number;
    mixX: number;
    mixY: number;
    mixScaleX: number;
    mixScaleY: number;
    mixShearY: number;
    temp: Vector2;
    active: boolean;
    constructor(data: TransformConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    update(): void;
    applyAbsoluteWorld(): void;
    applyRelativeWorld(): void;
    applyAbsoluteLocal(): void;
    applyRelativeLocal(): void;
}
