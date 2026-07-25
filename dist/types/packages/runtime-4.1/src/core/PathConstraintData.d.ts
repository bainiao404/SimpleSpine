import { ConstraintData } from './ConstraintData';
import type { SlotData } from './SlotData';
import type { BoneData } from './BoneData';
import { PositionMode, RotateMode } from '@pixi-spine/base';
/** Stores the setup pose for a {@link PathConstraint}.
 *
 * See [Path constraints](http://esotericsoftware.com/spine-path-constraints) in the Spine User Guide.
 * @public
 * */
export declare class PathConstraintData extends ConstraintData {
    /** The bones that will be modified by this path constraint. */
    bones: BoneData[];
    /** The slot whose path attachment will be used to constrained the bones. */
    private _target;
    set target(slotData: SlotData);
    get target(): SlotData;
    /** The mode for positioning the first bone on the path. */
    positionMode: PositionMode;
    /** The mode for positioning the bones after the first bone on the path. */
    spacingMode: SpacingMode;
    /** The mode for adjusting the rotation of the bones. */
    rotateMode: RotateMode;
    /** An offset added to the constrained bone rotation. */
    offsetRotation: number;
    /** The position along the path. */
    position: number;
    /** The spacing between bones. */
    spacing: number;
    mixRotate: number;
    mixX: number;
    mixY: number;
    constructor(name: string);
}
/** Controls how bones after the first bone are positioned along the path.
 *
 * [Spacing mode](http://esotericsoftware.com/spine-path-constraints#Spacing-mode) in the Spine User Guide.
 * @public
 * */
export declare enum SpacingMode {
    Length = 0,
    Fixed = 1,
    Percent = 2,
    Proportional = 3
}
