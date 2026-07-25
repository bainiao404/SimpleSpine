import { AttachmentLoader } from './attachments/AttachmentLoader.js';
import { SkeletonData } from './SkeletonData.js';
/** Loads skeleton data in the Spine binary format.
 * @public
 * See [Spine binary format](http://esotericsoftware.com/spine-binary-format) and
 * [JSON and binary data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the Spine
 * Runtimes Guide. */
export declare class SkeletonBinary {
    /** Scales bone positions, image sizes, and translations as they are loaded. This allows different size images to be used at
     * runtime than were used in Spine.
     *
     * See [Scaling](http://esotericsoftware.com/spine-loading-skeleton-data#Scaling) in the Spine Runtimes Guide. */
    scale: number;
    attachmentLoader: AttachmentLoader;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(binary: Uint8Array | ArrayBuffer): SkeletonData;
    private readSkin;
    private readAttachment;
    private readSequence;
    private readVertices;
    private readFloatArray;
    private readShortArray;
    private readAnimation;
}
/**
 * @public
 * */
export declare class BinaryInput {
    strings: string[];
    private index;
    private buffer;
    constructor(data: Uint8Array | ArrayBuffer, strings?: string[], index?: number, buffer?: DataView);
    readByte(): number;
    readUnsignedByte(): number;
    readShort(): number;
    readInt32(): number;
    readInt(optimizePositive: boolean): number;
    readStringRef(): string | null;
    readString(): string | null;
    readFloat(): number;
    readBoolean(): boolean;
}
