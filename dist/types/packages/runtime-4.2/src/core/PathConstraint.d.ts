import { PathAttachment } from './attachments';
import { Bone } from './Bone.js';
import { PathConstraintData } from './PathConstraintData.js';
import { Skeleton } from './Skeleton.js';
import { Slot } from './Slot.js';
import { Updatable } from './Updatable.js';
import { Physics } from '@pixi-spine/base';
/** Stores the current pose for a path constraint. A path constraint adjusts the rotation, translation, and scale of the
 * constrained bones so they follow a {@link PathAttachment}.
 *
 * See [Path constraints](http://esotericsoftware.com/spine-path-constraints) in the Spine User Guide.
 * @public
 * */
export declare class PathConstraint implements Updatable {
    static NONE: number;
    static BEFORE: number;
    static AFTER: number;
    static epsilon: number;
    /** The path constraint's setup pose data. */
    data: PathConstraintData;
    /** The bones that will be modified by this path constraint. */
    bones: Array<Bone>;
    /** The slot whose path attachment will be used to constrained the bones. */
    target: Slot;
    /** The position along the path. */
    position: number;
    /** The spacing between bones. */
    spacing: number;
    mixRotate: number;
    mixX: number;
    mixY: number;
    spaces: number[];
    positions: number[];
    world: number[];
    curves: number[];
    lengths: number[];
    segments: number[];
    active: boolean;
    constructor(data: PathConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    setToSetupPose(): void;
    update(physics: Physics): void;
    computeWorldPositions(path: PathAttachment, spacesCount: number, tangents: boolean): number[];
    addBeforePosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
    addAfterPosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
    addCurvePosition(p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number, out: Array<number>, o: number, tangents: boolean): void;
}
