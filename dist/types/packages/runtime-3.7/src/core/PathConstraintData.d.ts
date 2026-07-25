import type { SlotData } from './SlotData';
import type { BoneData } from './BoneData';
import type { RotateMode, PositionMode, IPathConstraintData } from '@pixi-spine/base';
/**
 * @public
 */
export declare class PathConstraintData implements IPathConstraintData {
    name: string;
    order: number;
    bones: BoneData[];
    target: SlotData;
    positionMode: PositionMode;
    spacingMode: SpacingMode;
    rotateMode: RotateMode;
    offsetRotation: number;
    position: number;
    spacing: number;
    rotateMix: number;
    translateMix: number;
    constructor(name: string);
}
/**
 * @public
 */
export declare enum SpacingMode {
    Length = 0,
    Fixed = 1,
    Percent = 2
}
