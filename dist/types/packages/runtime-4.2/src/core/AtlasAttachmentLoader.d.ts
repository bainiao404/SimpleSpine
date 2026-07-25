import { AttachmentLoader, BoundingBoxAttachment, ClippingAttachment, MeshAttachment, PathAttachment, PointAttachment, RegionAttachment, Sequence } from './attachments';
import { Skin } from './Skin.js';
import type { TextureAtlas } from '@pixi-spine/base';
/** An {@link AttachmentLoader} that configures attachments using texture regions from an TextureAtlas.
 *
 * See [Loading skeleton data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the
 * Spine Runtimes Guide.
 * @public
 * */
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
