import { VertexAttachment } from './Attachment';
import { AttachmentType, Color } from '@pixi-spine/base';
/**
 * @public
 */
export declare class PathAttachment extends VertexAttachment {
    type: AttachmentType;
    lengths: Array<number>;
    closed: boolean;
    constantSpeed: boolean;
    color: Color;
    constructor(name: string);
}
