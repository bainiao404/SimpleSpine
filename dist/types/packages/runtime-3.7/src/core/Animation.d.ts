import type { Event } from './Event';
import type { Skeleton } from './Skeleton';
import { VertexAttachment } from './attachments';
import { ArrayLike, MixBlend, MixDirection, IAnimation, ITimeline } from '@pixi-spine/base';
/**
 * @public
 */
export declare class Animation implements IAnimation<Timeline> {
    name: string;
    timelines: Array<Timeline>;
    duration: number;
    constructor(name: string, timelines: Array<Timeline>, duration: number);
    apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    static binarySearch(values: ArrayLike<number>, target: number, step?: number): number;
    static linearSearch(values: ArrayLike<number>, target: number, step: number): number;
}
/**
 * @public
 */
export interface Timeline extends ITimeline {
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    getPropertyId(): number;
}
/**
 * @public
 */
export declare enum TimelineType {
    rotate = 0,
    translate = 1,
    scale = 2,
    shear = 3,
    attachment = 4,
    color = 5,
    deform = 6,
    event = 7,
    drawOrder = 8,
    ikConstraint = 9,
    transformConstraint = 10,
    pathConstraintPosition = 11,
    pathConstraintSpacing = 12,
    pathConstraintMix = 13,
    twoColor = 14
}
/**
 * @public
 */
export declare abstract class CurveTimeline implements Timeline {
    static LINEAR: number;
    static STEPPED: number;
    static BEZIER: number;
    static BEZIER_SIZE: number;
    private curves;
    abstract getPropertyId(): number;
    constructor(frameCount: number);
    getFrameCount(): number;
    setLinear(frameIndex: number): void;
    setStepped(frameIndex: number): void;
    getCurveType(frameIndex: number): number;
    /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
     * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
     * the difference between the keyframe's values. */
    setCurve(frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
    getCurvePercent(frameIndex: number, percent: number): number;
    abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class RotateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATION: number;
    static ROTATION: number;
    boneIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and angle of the specified keyframe. */
    setFrame(frameIndex: number, time: number, degrees: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class TranslateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_X: number;
    static PREV_Y: number;
    static X: number;
    static Y: number;
    boneIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, x: number, y: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class ScaleTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class ShearTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class ColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    slotIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class TwoColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static PREV_R2: number;
    static PREV_G2: number;
    static PREV_B2: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    static R2: number;
    static G2: number;
    static B2: number;
    slotIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number, r2: number, g2: number, b2: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class AttachmentTimeline implements Timeline {
    slotIndex: number;
    frames: ArrayLike<number>;
    attachmentNames: Array<string>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, attachmentName: string): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class DeformTimeline extends CurveTimeline {
    slotIndex: number;
    attachment: VertexAttachment;
    frames: ArrayLike<number>;
    frameVertices: Array<ArrayLike<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time of the specified keyframe. */
    setFrame(frameIndex: number, time: number, vertices: ArrayLike<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class EventTimeline implements Timeline {
    frames: ArrayLike<number>;
    events: Array<Event>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time of the specified keyframe. */
    setFrame(frameIndex: number, event: Event): void;
    /** Fires events for frames > lastTime and <= time. */
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class DrawOrderTimeline implements Timeline {
    frames: ArrayLike<number>;
    drawOrders: Array<Array<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time of the specified keyframe.
     * @param drawOrder May be null to use bind pose draw order. */
    setFrame(frameIndex: number, time: number, drawOrder: Array<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class IkConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_MIX: number;
    static PREV_BEND_DIRECTION: number;
    static PREV_COMPRESS: number;
    static PREV_STRETCH: number;
    static MIX: number;
    static BEND_DIRECTION: number;
    static COMPRESS: number;
    static STRETCH: number;
    ikConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time, mix and bend direction of the specified keyframe. */
    setFrame(frameIndex: number, time: number, mix: number, bendDirection: number, compress: boolean, stretch: boolean): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class TransformConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static PREV_SCALE: number;
    static PREV_SHEAR: number;
    static ROTATE: number;
    static TRANSLATE: number;
    static SCALE: number;
    static SHEAR: number;
    transformConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and mixes of the specified keyframe. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number, scaleMix: number, shearMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class PathConstraintPositionTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_VALUE: number;
    static VALUE: number;
    pathConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, value: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/**
 * @public
 */
export declare class PathConstraintMixTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static ROTATE: number;
    static TRANSLATE: number;
    pathConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and mixes of the specified keyframe. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
