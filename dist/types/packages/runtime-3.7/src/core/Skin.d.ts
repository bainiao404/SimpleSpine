import type { Attachment } from './attachments';
import type { Skeleton } from './Skeleton';
import type { StringMap, ISkin } from '@pixi-spine/base';
/**
 * @public
 */
export declare class Skin implements ISkin {
    name: string;
    attachments: StringMap<Attachment>[];
    constructor(name: string);
    addAttachment(slotIndex: number, name: string, attachment: Attachment): void;
    /** @return May be null. */
    getAttachment(slotIndex: number, name: string): Attachment;
    /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
    attachAll(skeleton: Skeleton, oldSkin: Skin): void;
}
