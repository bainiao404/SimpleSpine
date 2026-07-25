import { AnimationState } from './core/AnimationState';
import { AnimationStateData } from './core/AnimationStateData';
import { Skeleton } from './core/Skeleton';
import { SpineBase } from '@pixi-spine/base';
import type { SkeletonData } from './core/SkeletonData';
/**
 * @public
 */
export declare class Spine extends SpineBase<Skeleton, SkeletonData, AnimationState, AnimationStateData> {
    createSkeleton(spineData: SkeletonData): void;
}
