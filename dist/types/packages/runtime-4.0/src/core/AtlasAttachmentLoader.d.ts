import { AttachmentLoader, RegionAttachment, MeshAttachment, BoundingBoxAttachment, PathAttachment, PointAttachment, ClippingAttachment } from './attachments';
import type { TextureAtlas } from '@pixi-spine/base';
import type { Skin } from './Skin';
/**
 * @public
 */
export declare class AtlasAttachmentLoader implements AttachmentLoader {
    atlas: TextureAtlas;
    constructor(atlas: TextureAtlas);
    /** @return May be null to not load an attachment. */
    newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment;
    /** @return May be null to not load an attachment. */
    newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment;
    /** @return May be null to not load an attachment. */
    newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
    /** @return May be null to not load an attachment */
    newPathAttachment(skin: Skin, name: string): PathAttachment;
    newPointAttachment(skin: Skin, name: string): PointAttachment;
    newClippingAttachment(skin: Skin, name: string): ClippingAttachment;
}
