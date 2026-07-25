import type { Constraint } from './Constraint';
import type { TransformConstraintData } from './TransformConstraintData';
import type { Bone } from './Bone';
import { Vector2 } from '@pixi-spine/base';
import type { Skeleton } from './Skeleton';
/**
 * @public
 */
export declare class TransformConstraint implements Constraint {
    data: TransformConstraintData;
    bones: Array<Bone>;
    target: Bone;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
    temp: Vector2;
    constructor(data: TransformConstraintData, skeleton: Skeleton);
    apply(): void;
    update(): void;
    applyAbsoluteWorld(): void;
    applyRelativeWorld(): void;
    applyAbsoluteLocal(): void;
    applyRelativeLocal(): void;
    getOrder(): number;
}
