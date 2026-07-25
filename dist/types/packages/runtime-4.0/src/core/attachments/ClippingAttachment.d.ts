import { Attachment, VertexAttachment } from './Attachment';
import { AttachmentType, Color, IClippingAttachment } from '@pixi-spine/base';
import type { SlotData } from '../SlotData';
/**
 * @public
 */
export declare class ClippingAttachment extends VertexAttachment implements IClippingAttachment {
    type: AttachmentType;
    endSlot: SlotData;
    /** The color of the clipping polygon as it was in Spine. Available only when nonessential data was exported. Clipping polygons
     * are not usually rendered at runtime. */
    color: Color;
    constructor(name: string);
    copy(): Attachment;
}
