import type { IEventData } from '@pixi-spine/base';
/** Stores the setup pose values for an {@link Event}.
 *
 * See [Events](http://esotericsoftware.com/spine-events) in the Spine User Guide.
 * @public
 * */
export declare class EventData implements IEventData {
    name: string;
    intValue: number;
    floatValue: number;
    stringValue: string | null;
    audioPath: string | null;
    volume: number;
    balance: number;
    constructor(name: string);
}
