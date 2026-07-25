import { SpineBase } from '@pixi-spine/base';
import { Skeleton } from './core/Skeleton';
import type { SkeletonData } from './core/SkeletonData';
import { AnimationState } from './core/AnimationState';
import { AnimationStateData } from './core/AnimationStateData';
/**
 * @public
 */
export declare class Spine extends SpineBase<Skeleton, SkeletonData, AnimationState, AnimationStateData> {
    createSkeleton(spineData: SkeletonData): void;
}
