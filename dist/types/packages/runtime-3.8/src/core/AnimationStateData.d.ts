import type { SkeletonData } from './SkeletonData';
import type { IAnimation, IAnimationStateData, StringMap } from '@pixi-spine/base';
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
    setMixWith(from: IAnimation, to: IAnimation, duration: number): void;
    getMix(from: IAnimation, to: IAnimation): number;
}
