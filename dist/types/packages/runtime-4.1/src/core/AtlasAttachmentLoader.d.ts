import { AttachmentLoader, RegionAttachment, MeshAttachment, BoundingBoxAttachment, PathAttachment, PointAttachment, ClippingAttachment, Sequence } from './attachments';
import type { TextureAtlas } from '@pixi-spine/base';
import type { Skin } from './Skin';
/**
 * @public
 */
export declare class AtlasAttachmentLoader implements AttachmentLoader {
    atlas: TextureAtlas;
    constructor(atlas: TextureAtlas);
    loadSequence(name: string, basePath: string, sequence: Sequence): void;
    newRegionAttachment(skin: Skin, name: string, path: string, sequence: Sequence): RegionAttachment;
    newMeshAttachment(skin: Skin, name: string, path: string, sequence: Sequence): MeshAttachment;
    newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
    newPathAttachment(skin: Skin, name: string): PathAttachment;
    newPointAttachment(skin: Skin, name: string): PointAttachment;
    newClippingAttachment(skin: Skin, name: string): ClippingAttachment;
}
