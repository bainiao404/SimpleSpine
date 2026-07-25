import type { Attachment, AttachmentLoader, VertexAttachment } from './attachments';
import { SkeletonData } from './SkeletonData';
import { SpacingMode } from './PathConstraintData';
import { Skin } from './Skin';
import { CurveTimeline } from './Animation';
import { PositionMode, RotateMode, TransformMode } from '@pixi-spine/base';
import { BLEND_MODES } from '@pixi-spine/base';
/**
 * @public
 */
export declare class SkeletonJson {
    attachmentLoader: AttachmentLoader;
    scale: number;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(json: string | any): SkeletonData;
    readAttachment(map: any, skin: Skin, slotIndex: number, name: string, skeletonData: SkeletonData): Attachment;
    readVertices(map: any, attachment: VertexAttachment, verticesLength: number): void;
    readAnimation(map: any, name: string, skeletonData: SkeletonData): void;
    readCurve(map: any, timeline: CurveTimeline, frameIndex: number): void;
    getValue(map: any, prop: string, defaultValue: any): any;
    static blendModeFromString(str: string): BLEND_MODES;
    static positionModeFromString(str: string): PositionMode;
    static spacingModeFromString(str: string): SpacingMode;
    static rotateModeFromString(str: string): RotateMode;
    static transformModeFromString(str: string): TransformMode;
}
