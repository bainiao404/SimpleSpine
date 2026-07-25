import { BLEND_MODES } from '@pixi/core';
import { BoneData } from './BoneData.js';
import { Color } from '@pixi-spine/base';
import type { ISlotData } from '@pixi-spine/base';
/** Stores the setup pose for a {@link Slot}.
 * @public
 * */
export declare class SlotData implements ISlotData {
    /** The index of the slot in {@link Skeleton#getSlots()}. */
    index: number;
    /** The name of the slot, which is unique across all slots in the skeleton. */
    name: string;
    /** The bone this slot belongs to. */
    boneData: BoneData;
    /** The color used to tint the slot's attachment. If {@link #getDarkColor()} is set, this is used as the light color for two
     * color tinting. */
    color: Color;
    /** The dark color used to tint the slot's attachment for two color tinting, or null if two color tinting is not used. The dark
     * color's alpha is not used. */
    darkColor: Color | null;
    /** The name of the attachment that is visible for this slot in the setup pose, or null if no attachment is visible. */
    attachmentName: string | null;
    /** The blend mode for drawing the slot's attachment. */
    blendMode: BLEND_MODES;
    /** False if the slot was hidden in Spine and nonessential data was exported. Does not affect runtime rendering. */
    visible: boolean;
    constructor(index: number, name: string, boneData: BoneData);
}
