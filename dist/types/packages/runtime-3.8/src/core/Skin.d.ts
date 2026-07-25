import { Attachment } from './attachments';
import type { BoneData } from './BoneData';
import type { ConstraintData } from './Constraint';
import type { Skeleton } from './Skeleton';
import type { StringMap, ISkin } from '@pixi-spine/base';
/**
 * @public
 */
export declare class SkinEntry {
    slotIndex: number;
    name: string;
    attachment: Attachment;
    constructor(slotIndex: number, name: string, attachment: Attachment);
}
/**
 * @public
 */
export declare class Skin implements ISkin {
    name: string;
    attachments: StringMap<Attachment>[];
    bones: BoneData[];
    constraints: ConstraintData[];
    constructor(name: string);
    setAttachment(slotIndex: number, name: string, attachment: Attachment): void;
    addSkin(skin: Skin): void;
    copySkin(skin: Skin): void;
    /** @return May be null. */
    getAttachment(slotIndex: number, name: string): Attachment;
    removeAttachment(slotIndex: number, name: string): void;
    getAttachments(): Array<SkinEntry>;
    getAttachmentsForSlot(slotIndex: number, attachments: Array<SkinEntry>): void;
    clear(): void;
    /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
    attachAll(skeleton: Skeleton, oldSkin: Skin): void;
}
