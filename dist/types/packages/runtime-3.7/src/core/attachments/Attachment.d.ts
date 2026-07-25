import type { IAttachment, ArrayLike, AttachmentType } from '@pixi-spine/base';
import type { Slot } from '../Slot';
/**
 * @public
 */
export declare abstract class Attachment implements IAttachment {
    name: string;
    type: AttachmentType;
    constructor(name: string);
}
/**
 * @public
 */
export declare abstract class VertexAttachment extends Attachment {
    private static nextID;
    id: number;
    bones: Array<number>;
    vertices: ArrayLike<number>;
    worldVerticesLength: number;
    constructor(name: string);
    computeWorldVerticesOld(slot: Slot, worldVertices: ArrayLike<number>): void;
    /** Transforms local vertices to world coordinates.
     * @param start The index of the first local vertex value to transform. Each vertex has 2 values, x and y.
     * @param count The number of world vertex values to output. Must be <= {@link #getWorldVerticesLength()} - start.
     * @param worldVertices The output world vertices. Must have a length >= offset + count.
     * @param offset The worldVertices index to begin writing values. */
    computeWorldVertices(slot: Slot, start: number, count: number, worldVertices: ArrayLike<number>, offset: number, stride: number): void;
    /** Returns true if a deform originally applied to the specified attachment should be applied to this attachment. */
    applyDeform(sourceAttachment: VertexAttachment): boolean;
}
