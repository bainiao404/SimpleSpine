import type { BoneData } from './BoneData';
import { ConstraintData } from './Constraint';
/**
 * @public
 */
export declare class TransformConstraintData extends ConstraintData {
    bones: BoneData[];
    target: BoneData;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
    offsetRotation: number;
    offsetX: number;
    offsetY: number;
    offsetScaleX: number;
    offsetScaleY: number;
    offsetShearY: number;
    relative: boolean;
    local: boolean;
    constructor(name: string);
}
