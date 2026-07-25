import { Attachment, VertexAttachment } from './Attachment';
import { AttachmentType, Color, IMeshAttachment, TextureRegion } from '@pixi-spine/base';
/**
 * @public
 */
export declare class MeshAttachment extends VertexAttachment implements IMeshAttachment {
    type: AttachmentType;
    region: TextureRegion;
    path: string;
    regionUVs: Float32Array;
    triangles: Array<number>;
    color: Color;
    width: number;
    height: number;
    hullLength: number;
    edges: Array<number>;
    private parentMesh;
    tempColor: Color;
    constructor(name: string);
    getParentMesh(): MeshAttachment;
    /** @param parentMesh May be null. */
    setParentMesh(parentMesh: MeshAttachment): void;
    copy(): Attachment;
    newLinkedMesh(): MeshAttachment;
}
