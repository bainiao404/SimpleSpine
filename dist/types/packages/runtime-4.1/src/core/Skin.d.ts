import { Attachment } from './attachments';
import type { BoneData } from './BoneData';
import type { ConstraintData } from './ConstraintData';
import type { Skeleton } from './Skeleton';
import type { StringMap, ISkin } from '@pixi-spine/base';
/** Stores an entry in the skin consisting of the slot index, name, and attachment
 * @public
 * **/
export declare class SkinEntry {
    slotIndex: number;
    name: string;
    attachment: Attachment;
    constructor(slotIndex: number, name: string, attachment: Attachment);
}
/** Stores attachments by slot index and attachment name.
 *
 * See SkeletonData {@link SkeletonData#defaultSkin}, Skeleton {@link Skeleton#skin}, and
 * [Runtime skins](http://esotericsoftware.com/spine-runtime-skins) in the Spine Runtimes Guide.
 * @public
 * */
export declare class Skin implements ISkin {
    /** The skin's name, which is unique across all skins in the skeleton. */
    name: string;
    attachments: StringMap<Attachment>[];
    bones: BoneData[];
    constraints: ConstraintData[];
    constructor(name: string);
    /** Adds an attachment to the skin for the specified slot index and name. */
    setAttachment(slotIndex: number, name: string, attachment: Attachment): void;
    /** Adds all attachments, bones, and constraints from the specified skin to this skin. */
    addSkin(skin: Skin): void;
    /** Adds all bones and constraints and copies of all attachments from the specified skin to this skin. Mesh attachments are not
     * copied, instead a new linked mesh is created. The attachment copies can be modified without affecting the originals. */
    copySkin(skin: Skin): void;
    /** Returns the attachment for the specified slot index and name, or null. */
    getAttachment(slotIndex: number, name: string): Attachment | null;
    /** Removes the attachment in the skin for the specified slot index and name, if any. */
    removeAttachment(slotIndex: number, name: string): void;
    /** Returns all attachments in this skin. */
    getAttachments(): Array<SkinEntry>;
    /** Returns all attachments in this skin for the specified slot index. */
    getAttachmentsForSlot(slotIndex: number, attachments: Array<SkinEntry>): void;
    /** Clears all attachments, bones, and constraints. */
    clear(): void;
    /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
    attachAll(skeleton: Skeleton, oldSkin: Skin): void;
}
