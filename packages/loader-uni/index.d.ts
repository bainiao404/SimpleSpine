/// <reference path="./global.d.ts" />

import { IAnimationState } from '@pixi-spine/base';
import { IAnimationStateData } from '@pixi-spine/base';
import { ISkeleton } from '@pixi-spine/base';
import { ISkeletonData } from '@pixi-spine/base';
import * as spine38 from '@pixi-spine/runtime-3.8';
import * as spine40 from '@pixi-spine/runtime-4.0';
import * as spine41 from '@pixi-spine/runtime-4.1';
import * as spine42 from '@esotericsoftware/spine-pixi-v7';
import { SpineBase } from '@pixi-spine/base';

/**
 * @public
 */
export declare class Spine extends SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData> {
    createSkeleton(spineData: ISkeletonData): void;
}

export { spine38 }

export { spine40 }

export { spine41 }

export { spine42 }

export { }
