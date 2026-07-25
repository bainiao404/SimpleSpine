import { BoneData } from './BoneData.js';
import { ConstraintData } from './ConstraintData.js';
/** Stores the setup pose for a {@link PhysicsConstraint}.
 * <p>
 * See <a href="http://esotericsoftware.com/spine-physics-constraints">Physics constraints</a> in the Spine User Guide.
 * @public
 * */
export declare class PhysicsConstraintData extends ConstraintData {
    private _bone;
    set bone(boneData: BoneData);
    get bone(): BoneData;
    x: number;
    y: number;
    rotate: number;
    scaleX: number;
    shearX: number;
    limit: number;
    step: number;
    inertia: number;
    strength: number;
    damping: number;
    massInverse: number;
    wind: number;
    gravity: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained poses. */
    mix: number;
    inertiaGlobal: boolean;
    strengthGlobal: boolean;
    dampingGlobal: boolean;
    massGlobal: boolean;
    windGlobal: boolean;
    gravityGlobal: boolean;
    mixGlobal: boolean;
    constructor(name: string);
}
