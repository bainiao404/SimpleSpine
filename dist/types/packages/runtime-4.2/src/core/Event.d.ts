import { EventData } from './EventData.js';
/** Stores the current pose values for an {@link Event}.
 *
 * See Timeline {@link Timeline#apply()},
 * AnimationStateListener {@link AnimationStateListener#event()}, and
 * [Events](http://esotericsoftware.com/spine-events) in the Spine User Guide.
 * @public
 * */
export declare class Event {
    data: EventData;
    intValue: number;
    floatValue: number;
    stringValue: string | null;
    time: number;
    volume: number;
    balance: number;
    constructor(time: number, data: EventData);
}
