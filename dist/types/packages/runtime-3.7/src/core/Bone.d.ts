import { Matrix } from '@pixi/core';
import type { Updatable } from './Updatable';
import type { BoneData } from './BoneData';
import type { Skeleton } from './Skeleton';
import { IBone, Vector2 } from '@pixi-spine/base';
/**
 * @public
 */
export declare class Bone implements Updatable, IBone {
    matrix: Matrix;
    get worldX(): number;
    get worldY(): number;
    data: BoneData;
    skeleton: Skeleton;
    parent: Bone;
    children: Bone[];
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
    ax: number;
    ay: number;
    arotation: number;
    ascaleX: number;
    ascaleY: number;
    ashearX: number;
    ashearY: number;
    appliedValid: boolean;
    sorted: boolean;
    /** @param parent May be null. */
    constructor(data: BoneData, skeleton: Skeleton, parent: Bone);
    /** NOT USED IN 3.7. Needed for the debug graph code */
    active: boolean;
    /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
    update(): void;
    /** Computes the world transform using the parent bone and this bone's local transform. */
    updateWorldTransform(): void;
    /** Computes the world transform using the parent bone and the specified local transform. */
    updateWorldTransformWith(x: number, y: number, rotation: number, scaleX: number, scaleY: number, shearX: number, shearY: number): void;
    setToSetupPose(): void;
    getWorldRotationX(): number;
    getWorldRotationY(): number;
    getWorldScaleX(): number;
    getWorldScaleY(): number;
    /** Computes the individual applied transform values from the world transform. This can be useful to perform processing using
     * the applied transform after the world transform has been modified directly (eg, by a constraint).
     * <p>
     * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. */
    updateAppliedTransform(): void;
    worldToLocal(world: Vector2): Vector2;
    localToWorld(local: Vector2): Vector2;
    worldToLocalRotation(worldRotation: number): number;
    localToWorldRotation(localRotation: number): number;
    rotateWorld(degrees: number): void;
}
