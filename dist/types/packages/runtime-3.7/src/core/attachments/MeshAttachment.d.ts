import { VertexAttachment } from './Attachment';
import { AttachmentType, Color, IMeshAttachment, TextureRegion } from '@pixi-spine/base';
/**
 * @public
 */
export declare class MeshAttachment extends VertexAttachment implements IMeshAttachment {
    type: AttachmentType;
    region: TextureRegion;
    path: string;
    regionUVs: Float32Array;
    uvs: ArrayLike<number>;
    triangles: Array<number>;
    color: Color;
    hullLength: number;
    private parentMesh;
    inheritDeform: boolean;
    tempColor: Color;
    constructor(name: string);
    applyDeform(sourceAttachment: VertexAttachment): boolean;
    getParentMesh(): MeshAttachment;
    /** @param parentMesh May be null. */
    setParentMesh(parentMesh: MeshAttachment): void;
}
