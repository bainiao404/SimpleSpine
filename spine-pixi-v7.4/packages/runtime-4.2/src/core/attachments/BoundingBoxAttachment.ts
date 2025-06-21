import { Attachment, VertexAttachment } from './Attachment.js';
import { Color } from '@pixi-spine/base';

/** An attachment with vertices that make up a polygon. Can be used for hit detection, creating physics bodies, spawning particle
 * effects, and more.
 * @public
 * See {@link SkeletonBounds} and [Bounding Boxes](http://esotericsoftware.com/spine-bounding-boxes) in the Spine User
 * Guide. */
export class BoundingBoxAttachment extends VertexAttachment {
    color = new Color(1, 1, 1, 1);

    constructor(name: string) {
        super(name);
    }

    copy(): Attachment {
        const copy = new BoundingBoxAttachment(this.name);

        this.copyTo(copy);
        copy.color.setFromColor(this.color);

        return copy;
    }
}
