import type { AttachmentLoader } from './attachments';
import { SkeletonData } from './SkeletonData';
import { BLEND_MODES } from '@pixi/core';
/** Loads skeleton data in the Spine binary format.
 *
 * See [Spine binary format](http://esotericsoftware.com/spine-binary-format) and
 * [JSON and binary data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the Spine
 * Runtimes Guide.
 * @public
 * */
export declare class SkeletonBinary {
    ver40: boolean;
    static BlendModeValues: BLEND_MODES[];
    /** Scales bone positions, image sizes, and translations as they are loaded. This allows different size images to be used at
     * runtime than were used in Spine.
     *
     * See [Scaling](http://esotericsoftware.com/spine-loading-skeleton-data#Scaling) in the Spine Runtimes Guide. */
    scale: number;
    attachmentLoader: AttachmentLoader;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(binary: Uint8Array): SkeletonData;
    private readSkin;
    private readAttachment;
    private readSequence;
    private readDeformTimelineType;
    private readVertices;
    private readFloatArray;
    private readShortArray;
    private readAnimation;
}
