import { VertexAttachment } from './Attachment';
import { AttachmentType, Color } from '@pixi-spine/base';
/**
 * @public
 */
export declare class BoundingBoxAttachment extends VertexAttachment {
    type: AttachmentType;
    color: Color;
    constructor(name: string);
}
