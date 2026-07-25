import { IAnimationState, IAnimationStateListener, ITrackEntry, MixBlend, Pool, IntSet } from '@pixi-spine/base';
import { Animation, Timeline } from './Animation';
import type { AnimationStateData } from './AnimationStateData';
import type { Event } from './Event';
import type { Skeleton } from './Skeleton';
/**
 * @public
 */
export declare class AnimationState implements IAnimationState<AnimationStateData> {
    static emptyAnimation: Animation;
    static SUBSEQUENT: number;
    static FIRST: number;
    static HOLD: number;
    static HOLD_MIX: number;
    data: AnimationStateData;
    tracks: TrackEntry[];
    events: Event[];
    listeners: AnimationStateListener[];
    queue: EventQueue;
    propertyIDs: IntSet;
    animationsChanged: boolean;
    timeScale: number;
    trackEntryPool: Pool<TrackEntry>;
    constructor(data: AnimationStateData);
    update(delta: number): void;
    updateMixingFrom(to: TrackEntry, delta: number): boolean;
    apply(skeleton: Skeleton): boolean;
    applyMixingFrom(to: TrackEntry, skeleton: Skeleton, blend: MixBlend): number;
    applyRotateTimeline(timeline: Timeline, skeleton: Skeleton, time: number, alpha: number, blend: MixBlend, timelinesRotation: Array<number>, i: number, firstFrame: boolean): void;
    queueEvents(entry: TrackEntry, animationTime: number): void;
    clearTracks(): void;
    clearTrack(trackIndex: number): void;
    setCurrent(index: number, current: TrackEntry, interrupt: boolean): void;
    setAnimation(trackIndex: number, animationName: string, loop: boolean): TrackEntry;
    setAnimationWith(trackIndex: number, animation: Animation, loop: boolean): TrackEntry;
    addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): TrackEntry;
    addAnimationWith(trackIndex: number, animation: Animation, loop: boolean, delay: number): TrackEntry;
    setEmptyAnimation(trackIndex: number, mixDuration: number): TrackEntry;
    addEmptyAnimation(trackIndex: number, mixDuration: number, delay: number): TrackEntry;
    setEmptyAnimations(mixDuration: number): void;
    expandToIndex(index: number): TrackEntry;
    trackEntry(trackIndex: number, animation: Animation, loop: boolean, last: TrackEntry): TrackEntry;
    disposeNext(entry: TrackEntry): void;
    _animationsChanged(): void;
    setTimelineModes(entry: TrackEntry): void;
    hasTimeline(entry: TrackEntry, id: number): boolean;
    getCurrent(trackIndex: number): TrackEntry;
    addListener(listener: AnimationStateListener): void;
    /** Removes the listener added with {@link #addListener(AnimationStateListener)}. */
    removeListener(listener: AnimationStateListener): void;
    clearListeners(): void;
    clearListenerNotifications(): void;
    onComplete: (trackIndex: number, loopCount: number) => any;
    onEvent: (trackIndex: number, event: Event) => any;
    onStart: (trackIndex: number) => any;
    onEnd: (trackIndex: number) => any;
    private static deprecatedWarning1;
    setAnimationByName(trackIndex: number, animationName: string, loop: boolean): void;
    private static deprecatedWarning2;
    addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number): void;
    private static deprecatedWarning3;
    hasAnimation(animationName: string): boolean;
    hasAnimationByName(animationName: string): boolean;
}
/**
 * @public
 */
export declare class TrackEntry implements ITrackEntry {
    animation: Animation;
    next: TrackEntry;
    mixingFrom: TrackEntry;
    mixingTo: TrackEntry;
    listener: AnimationStateListener;
    trackIndex: number;
    loop: boolean;
    holdPrevious: boolean;
    eventThreshold: number;
    attachmentThreshold: number;
    drawOrderThreshold: number;
    animationStart: number;
    animationEnd: number;
    animationLast: number;
    nextAnimationLast: number;
    delay: number;
    trackTime: number;
    trackLast: number;
    nextTrackLast: number;
    trackEnd: number;
    timeScale: number;
    alpha: number;
    mixTime: number;
    mixDuration: number;
    interruptAlpha: number;
    totalAlpha: number;
    mixBlend: MixBlend;
    timelineMode: number[];
    timelineHoldMix: TrackEntry[];
    timelinesRotation: number[];
    reset(): void;
    getAnimationTime(): number;
    setAnimationLast(animationLast: number): void;
    isComplete(): boolean;
    resetRotationDirections(): void;
    onComplete: (trackIndex: number, loopCount: number) => any;
    onEvent: (trackIndex: number, event: Event) => any;
    onStart: (trackIndex: number) => any;
    onEnd: (trackIndex: number) => any;
    private static deprecatedWarning1;
    private static deprecatedWarning2;
    get time(): number;
    set time(value: number);
    get endTime(): number;
    set endTime(value: number);
    loopsCount(): number;
}
/**
 * @public
 */
export declare class EventQueue {
    objects: Array<any>;
    drainDisabled: boolean;
    animState: AnimationState;
    constructor(animState: AnimationState);
    start(entry: TrackEntry): void;
    interrupt(entry: TrackEntry): void;
    end(entry: TrackEntry): void;
    dispose(entry: TrackEntry): void;
    complete(entry: TrackEntry): void;
    event(entry: TrackEntry, event: Event): void;
    private static deprecatedWarning1;
    deprecateStuff(): boolean;
    drain(): void;
    clear(): void;
}
/**
 * @public
 */
export declare enum EventType {
    start = 0,
    interrupt = 1,
    end = 2,
    dispose = 3,
    complete = 4,
    event = 5
}
/**
 * @public
 */
export interface AnimationStateListener extends IAnimationStateListener {
    /** Invoked when this entry has been set as the current entry. */
    start?(entry: TrackEntry): void;
    /** Invoked when another entry has replaced this entry as the current entry. This entry may continue being applied for
     * mixing. */
    interrupt?(entry: TrackEntry): void;
    /** Invoked when this entry is no longer the current entry and will never be applied again. */
    end?(entry: TrackEntry): void;
    /** Invoked when this entry will be disposed. This may occur without the entry ever being set as the current entry.
     * References to the entry should not be kept after dispose is called, as it may be destroyed or reused. */
    dispose?(entry: TrackEntry): void;
    /** Invoked every time this entry's animation completes a loop. */
    complete?(entry: TrackEntry): void;
    /** Invoked when this entry's animation triggers an event. */
    event?(entry: TrackEntry, event: Event): void;
}
/**
 * @public
 */
export declare abstract class AnimationStateAdapter2 implements AnimationStateListener {
    start(entry: TrackEntry): void;
    interrupt(entry: TrackEntry): void;
    end(entry: TrackEntry): void;
    dispose(entry: TrackEntry): void;
    complete(entry: TrackEntry): void;
    event(entry: TrackEntry, event: Event): void;
}
