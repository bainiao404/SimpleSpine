import { Color, ISlot } from '@pixi-spine/base';
import type { Attachment } from './attachments/Attachment';
import type { Bone } from './Bone';
import type { SlotData } from './SlotData';
/**
 * @public
 */
export declare class Slot implements ISlot {
    blendMode: number;
    data: SlotData;
    bone: Bone;
    color: Color;
    darkColor: Color;
    attachment: Attachment;
    private attachmentTime;
    attachmentVertices: number[];
    constructor(data: SlotData, bone: Bone);
    /** @return May be null. */
    getAttachment(): Attachment;
    /** Sets the attachment and if it changed, resets {@link #getAttachmentTime()} and clears {@link #getAttachmentVertices()}.
     * @param attachment May be null. */
    setAttachment(attachment: Attachment): void;
    setAttachmentTime(time: number): void;
    /** Returns the time since the attachment was set. */
    getAttachmentTime(): number;
    setToSetupPose(): void;
}
