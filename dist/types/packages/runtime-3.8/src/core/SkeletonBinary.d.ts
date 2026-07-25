import type { AttachmentLoader } from './attachments';
import { SkeletonData } from './SkeletonData';
import { SpacingMode } from './PathConstraintData';
import { CurveTimeline } from './Animation';
import { PositionMode, RotateMode, TransformMode } from '@pixi-spine/base';
import { BLEND_MODES } from '@pixi-spine/base';
/**
 * @public
 */
export declare class SkeletonBinary {
    static AttachmentTypeValues: number[];
    static TransformModeValues: TransformMode[];
    static PositionModeValues: PositionMode[];
    static SpacingModeValues: SpacingMode[];
    static RotateModeValues: RotateMode[];
    static BlendModeValues: BLEND_MODES[];
    static BONE_ROTATE: number;
    static BONE_TRANSLATE: number;
    static BONE_SCALE: number;
    static BONE_SHEAR: number;
    static SLOT_ATTACHMENT: number;
    static SLOT_COLOR: number;
    static SLOT_TWO_COLOR: number;
    static PATH_POSITION: number;
    static PATH_SPACING: number;
    static PATH_MIX: number;
    static CURVE_LINEAR: number;
    static CURVE_STEPPED: number;
    static CURVE_BEZIER: number;
    attachmentLoader: AttachmentLoader;
    scale: number;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(binary: Uint8Array): SkeletonData;
    private readSkin;
    private readAttachment;
    private readVertices;
    private readFloatArray;
    private readShortArray;
    private readAnimation;
    private readCurve;
    setCurve(timeline: CurveTimeline, frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
}
