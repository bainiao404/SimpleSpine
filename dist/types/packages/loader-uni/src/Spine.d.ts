import * as spine42 from '@esotericsoftware/spine-pixi-v8';
import { IAnimationState, IAnimationStateData, ISkeleton, ISkeletonData, SpineBase } from '@pixi-spine/base';
import * as spine38 from '@pixi-spine/runtime-3.8';
import * as spine40 from '@pixi-spine/runtime-4.0';
import * as spine41 from '@pixi-spine/runtime-4.1';
export { spine38 };
export { spine40 };
export { spine41 };
export { spine42 };
/**
 * @public
 */
export declare class Spine extends SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData> {
    createSkeleton(spineData: ISkeletonData): void;
}
