import type { BoneData } from './BoneData';
/**
 * @public
 */
export declare class TransformConstraintData {
    name: string;
    order: number;
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
