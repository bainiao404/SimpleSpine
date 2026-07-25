import { VertexAttachment } from './Attachment';
import { AttachmentType, Color, IClippingAttachment } from '@pixi-spine/base';
import type { SlotData } from '../SlotData';
/**
 * @public
 */
export declare class ClippingAttachment extends VertexAttachment implements IClippingAttachment {
    type: AttachmentType;
    endSlot: SlotData;
    color: Color;
    constructor(name: string);
}
