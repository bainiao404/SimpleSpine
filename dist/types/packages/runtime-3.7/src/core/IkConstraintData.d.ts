import type { BoneData } from './BoneData';
/**
 * @public
 */
export declare class IkConstraintData {
    name: string;
    order: number;
    bones: BoneData[];
    target: BoneData;
    bendDirection: number;
    compress: boolean;
    stretch: boolean;
    uniform: boolean;
    mix: number;
    constructor(name: string);
}
