import { IHasTextureRegion, ISequence, TextureRegion } from '@pixi-spine/base';
import type { Slot } from '../Slot.js';
/**
 * @public
 */
export declare class Sequence implements ISequence {
    private static _nextID;
    id: number;
    regions: TextureRegion[];
    start: number;
    digits: number;
    /** The index of the region to show for the setup pose. */
    setupIndex: number;
    constructor(count: number);
    copy(): Sequence;
    apply(slot: Slot, attachment: IHasTextureRegion): void;
    getPath(basePath: string, index: number): string;
    private static nextID;
}
/**
 * @public
 * */
export declare enum SequenceMode {
    hold = 0,
    once = 1,
    loop = 2,
    pingpong = 3,
    onceReverse = 4,
    loopReverse = 5,
    pingpongReverse = 6
}
/**
 * @public
 * */
export declare const SequenceModeValues: SequenceMode[];
