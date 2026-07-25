import type { Updatable } from './Updatable';
import type { IkConstraintData } from './IkConstraintData';
import type { Bone } from './Bone';
import type { Skeleton } from './Skeleton';
import { IIkConstraint } from '@pixi-spine/base';
/**
 * @public
 */
export declare class IkConstraint implements IIkConstraint, Updatable {
    data: IkConstraintData;
    bones: Array<Bone>;
    target: Bone;
    bendDirection: number;
    compress: boolean;
    stretch: boolean;
    mix: number;
    softness: number;
    active: boolean;
    constructor(data: IkConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    apply(): void;
    update(): void;
    /** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
     * coordinate system. */
    apply1(bone: Bone, targetX: number, targetY: number, compress: boolean, stretch: boolean, uniform: boolean, alpha: number): void;
    /** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
     * target is specified in the world coordinate system.
     * @param child A direct descendant of the parent bone. */
    apply2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, stretch: boolean, softness: number, alpha: number): void;
}
