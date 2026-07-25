import { VertexAttachment } from './Attachment';
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
    color: Color;
    constructor(name: string);
    computeWorldPosition(bone: Bone, point: Vector2): Vector2;
    computeWorldRotation(bone: Bone): number;
}
