import { BoneData } from './BoneData.js';
import { ConstraintData } from './ConstraintData.js';
/** Stores the setup pose for a {@link TransformConstraint}.
 * @public
 * See [Transform constraints](http://esotericsoftware.com/spine-transform-constraints) in the Spine User Guide. */
export declare class TransformConstraintData extends ConstraintData {
    /** The bones that will be modified by this transform constraint. */
    bones: BoneData[];
    /** The target bone whose world transform will be copied to the constrained bones. */
    private _target;
    set target(boneData: BoneData);
    get target(): BoneData;
    mixRotate: number;
    mixX: number;
    mixY: number;
    mixScaleX: number;
    mixScaleY: number;
    mixShearY: number;
    /** An offset added to the constrained bone rotation. */
    offsetRotation: number;
    /** An offset added to the constrained bone X translation. */
    offsetX: number;
    /** An offset added to the constrained bone Y translation. */
    offsetY: number;
    /** An offset added to the constrained bone scaleX. */
    offsetScaleX: number;
    /** An offset added to the constrained bone scaleY. */
    offsetScaleY: number;
    /** An offset added to the constrained bone shearY. */
    offsetShearY: number;
    relative: boolean;
    local: boolean;
    constructor(name: string);
}
