import { Color } from '@pixi-spine/base';
import type { ISlotData } from '@pixi-spine/base';
import { BLEND_MODES } from '@pixi-spine/base';
import type { BoneData } from './BoneData';
/**
 * @public
 */
export declare class SlotData implements ISlotData {
    index: number;
    name: string;
    boneData: BoneData;
    color: Color;
    darkColor: Color;
    attachmentName: string;
    blendMode: BLEND_MODES;
    constructor(index: number, name: string, boneData: BoneData);
}
