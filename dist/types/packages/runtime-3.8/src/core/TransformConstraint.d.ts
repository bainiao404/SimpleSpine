import type { Updatable } from './Updatable';
import type { TransformConstraintData } from './TransformConstraintData';
import type { Bone } from './Bone';
import { Vector2 } from '@pixi-spine/base';
import type { Skeleton } from './Skeleton';
/**
 * @public
 */
export declare class TransformConstraint implements Updatable {
    data: TransformConstraintData;
    bones: Array<Bone>;
    target: Bone;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
    temp: Vector2;
    active: boolean;
    constructor(data: TransformConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    apply(): void;
    update(): void;
    applyAbsoluteWorld(): void;
    applyRelativeWorld(): void;
    applyAbsoluteLocal(): void;
    applyRelativeLocal(): void;
}
