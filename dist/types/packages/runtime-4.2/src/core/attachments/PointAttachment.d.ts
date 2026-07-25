import { Bone } from '../Bone.js';
import { Attachment, VertexAttachment } from './Attachment.js';
import { Color, Vector2 } from '@pixi-spine/base';
/** An attachment which is a single point and a rotation. This can be used to spawn projectiles, particles, etc. A bone can be
 * used in similar ways, but a PointAttachment is slightly less expensive to compute and can be hidden, shown, and placed in a
 * skin.
 * @public
 * See [Point Attachments](http://esotericsoftware.com/spine-point-attachments) in the Spine User Guide. */
export declare class PointAttachment extends VertexAttachment {
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
