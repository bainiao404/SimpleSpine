import { ConstraintData } from './Constraint';
import type { BoneData } from './BoneData';
import type { IIkConstraintData } from '@pixi-spine/base';
/**
 * @public
 */
export declare class IkConstraintData extends ConstraintData implements IIkConstraintData {
    bones: BoneData[];
    target: BoneData;
    bendDirection: number;
    compress: boolean;
    stretch: boolean;
    uniform: boolean;
    mix: number;
    softness: number;
    constructor(name: string);
}
