import { Attachment, VertexAttachment } from './Attachment';
import { AttachmentType, Color, Vector2 } from '@pixi-spine/base';
import type { Bone } from '../Bone';
/**
 * @public
 */
export declare class PointAttachment extends VertexAttachment {
    type: AttachmentType;
    x: number;
    y: number;
    rotation: number;
    /** The color of the point attachment as it was in Spine. Available only when nonessential data was exported. Point attachments
     * are not usually rendered at runtime. */
    color: Color;
    constructor(name: string);
    computeWorldPosition(bone: Bone, point: Vector2): Vector2;
    computeWorldRotation(bone: Bone): number;
    copy(): Attachment;
}
