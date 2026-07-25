import { TransformMode } from '@pixi-spine/base';
/**
 * @public
 */
export declare class BoneData {
    index: number;
    name: string;
    parent: BoneData;
    length: number;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
    transformMode: TransformMode;
    constructor(index: number, name: string, parent: BoneData);
}
