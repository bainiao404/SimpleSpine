import type { SkeletonData } from './SkeletonData';
import type { IAnimationStateData, StringMap } from '@pixi-spine/base';
import type { Animation } from './Animation';
/**
 * @public
 */
export declare class AnimationStateData implements IAnimationStateData<SkeletonData, Animation> {
    skeletonData: SkeletonData;
    animationToMixTime: StringMap<number>;
    defaultMix: number;
    constructor(skeletonData: SkeletonData);
    setMix(fromName: string, toName: string, duration: number): void;
    private static deprecatedWarning1;
    setMixByName(fromName: string, toName: string, duration: number): void;
    setMixWith(from: Animation, to: Animation, duration: number): void;
    getMix(from: Animation, to: Animation): number;
}
