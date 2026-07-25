import { Bone } from './Bone.js';
import { PhysicsConstraintData } from './PhysicsConstraintData.js';
import { Skeleton } from './Skeleton.js';
import { Updatable } from './Updatable.js';
import { Physics } from '@pixi-spine/base';
/** Stores the current pose for a physics constraint. A physics constraint applies physics to bones.
 *
 * See <a href="http://esotericsoftware.com/spine-physics-constraints">Physics constraints</a> in the Spine User Guide.
 * @public
 * */
export declare class PhysicsConstraint implements Updatable {
    readonly data: PhysicsConstraintData;
    private _bone;
    set bone(bone: Bone);
    get bone(): Bone;
    inertia: number;
    strength: number;
    damping: number;
    massInverse: number;
    wind: number;
    gravity: number;
    mix: number;
    _reset: boolean;
    ux: number;
    uy: number;
    cx: number;
    cy: number;
    tx: number;
    ty: number;
    xOffset: number;
    xVelocity: number;
    yOffset: number;
    yVelocity: number;
    rotateOffset: number;
    rotateVelocity: number;
    scaleOffset: number;
    scaleVelocity: number;
    active: boolean;
    readonly skeleton: Skeleton;
    remaining: number;
    lastTime: number;
    constructor(data: PhysicsConstraintData, skeleton: Skeleton);
    reset(): void;
    setToSetupPose(): void;
    isActive(): boolean;
    /** Applies the constraint to the constrained bones. */
    update(physics: Physics): void;
    /** Translates the physics constraint so next {@link #update(Physics)} forces are applied as if the bone moved an additional
     * amount in world space. */
    translate(x: number, y: number): void;
    /** Rotates the physics constraint so next {@link #update(Physics)} forces are applied as if the bone rotated around the
     * specified point in world space. */
    rotate(x: number, y: number, degrees: number): void;
}
