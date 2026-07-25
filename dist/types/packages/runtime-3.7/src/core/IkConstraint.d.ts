import type { Constraint } from './Constraint';
import type { IkConstraintData } from './IkConstraintData';
import type { Bone } from './Bone';
import type { Skeleton } from './Skeleton';
/**
 * @public
 */
export declare class IkConstraint implements Constraint {
    data: IkConstraintData;
    bones: Array<Bone>;
    target: Bone;
    bendDirection: number;
    compress: boolean;
    stretch: boolean;
    mix: number;
    constructor(data: IkConstraintData, skeleton: Skeleton);
    getOrder(): number;
    apply(): void;
    update(): void;
    /** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
     * coordinate system. */
    apply1(bone: Bone, targetX: number, targetY: number, compress: boolean, stretch: boolean, uniform: boolean, alpha: number): void;
    /** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
     * target is specified in the world coordinate system.
     * @param child A direct descendant of the parent bone. */
    apply2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, stretch: boolean, alpha: number): void;
}
