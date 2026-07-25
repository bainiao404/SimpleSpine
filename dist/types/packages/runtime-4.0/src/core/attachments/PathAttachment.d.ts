import { Attachment, VertexAttachment } from './Attachment';
import { AttachmentType, Color } from '@pixi-spine/base';
/**
 * @public
 */
export declare class PathAttachment extends VertexAttachment {
    type: AttachmentType;
    /** The lengths along the path in the setup pose from the start of the path to the end of each Bezier curve. */
    lengths: Array<number>;
    /** If true, the start and end knots are connected. */
    closed: boolean;
    /** If true, additional calculations are performed to make calculating positions along the path more accurate. If false, fewer
     * calculations are performed but calculating positions along the path is less accurate. */
    constantSpeed: boolean;
    /** The color of the path as it was in Spine. Available only when nonessential data was exported. Paths are not usually
     * rendered at runtime. */
    color: Color;
    constructor(name: string);
    copy(): Attachment;
}
