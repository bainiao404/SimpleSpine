import type { ISkeletonData } from '@pixi-spine/base';
import type { Animation } from './Animation';
import type { BoneData } from './BoneData';
import type { SlotData } from './SlotData';
import type { Skin } from './Skin';
import type { EventData } from './EventData';
import type { IkConstraintData } from './IkConstraintData';
import type { TransformConstraintData } from './TransformConstraintData';
import type { PathConstraintData } from './PathConstraintData';
/**
 * @public
 */
export declare class SkeletonData implements ISkeletonData<BoneData, SlotData, Skin, Animation, EventData, IkConstraintData, TransformConstraintData, PathConstraintData> {
    name: string;
    bones: BoneData[];
    slots: SlotData[];
    skins: Skin[];
    defaultSkin: Skin;
    events: EventData[];
    animations: Animation[];
    ikConstraints: IkConstraintData[];
    transformConstraints: TransformConstraintData[];
    pathConstraints: PathConstraintData[];
    width: number;
    height: number;
    version: string;
    hash: string;
    fps: number;
    imagesPath: string;
    findBone(boneName: string): BoneData;
    findBoneIndex(boneName: string): number;
    findSlot(slotName: string): SlotData;
    findSlotIndex(slotName: string): number;
    findSkin(skinName: string): Skin;
    findEvent(eventDataName: string): EventData;
    findAnimation(animationName: string): Animation;
    findIkConstraint(constraintName: string): IkConstraintData;
    findTransformConstraint(constraintName: string): TransformConstraintData;
    findPathConstraint(constraintName: string): PathConstraintData;
    findPathConstraintIndex(pathConstraintName: string): number;
}
