import { Attachment } from './attachments';
import { Bone } from './Bone.js';
import { IkConstraint } from './IkConstraint.js';
import { PathConstraint } from './PathConstraint.js';
import { PhysicsConstraint } from './PhysicsConstraint.js';
import { SkeletonClipping } from './SkeletonClipping.js';
import { SkeletonData } from './SkeletonData.js';
import { Skin } from './Skin.js';
import { Slot } from './Slot.js';
import { TransformConstraint } from './TransformConstraint.js';
import { Updatable } from './Updatable.js';
import { Color, ISkeleton, Physics, Vector2 } from '@pixi-spine/base';
/** Stores the current pose for a skeleton.
 *
 * See [Instance objects](http://esotericsoftware.com/spine-runtime-architecture#Instance-objects) in the Spine Runtimes Guide.
 * @public
 * */
export declare class Skeleton implements ISkeleton<SkeletonData, Bone, Slot, Skin> {
    private static quadTriangles;
    static yDown: boolean;
    /** The skeleton's setup pose data. */
    data: SkeletonData;
    /** The skeleton's bones, sorted parent first. The root bone is always the first bone. */
    bones: Array<Bone>;
    /** The skeleton's slots in the setup pose draw order. */
    slots: Array<Slot>;
    /** The skeleton's slots in the order they should be drawn. The returned array may be modified to change the draw order. */
    drawOrder: Array<Slot>;
    /** The skeleton's IK constraints. */
    ikConstraints: Array<IkConstraint>;
    /** The skeleton's transform constraints. */
    transformConstraints: Array<TransformConstraint>;
    /** The skeleton's path constraints. */
    pathConstraints: Array<PathConstraint>;
    /** The skeleton's physics constraints. */
    physicsConstraints: Array<PhysicsConstraint>;
    /** The list of bones and constraints, sorted in the order they should be updated, as computed by {@link #updateCache()}. */
    _updateCache: Updatable[];
    /** The skeleton's current skin. May be null. */
    skin: Skin | null;
    /** The color to tint all the skeleton's attachments. */
    color: Color;
    /** Scales the entire skeleton on the X axis. This affects all bones, even if the bone's transform mode disallows scale
     * inheritance. */
    scaleX: number;
    /** Scales the entire skeleton on the Y axis. This affects all bones, even if the bone's transform mode disallows scale
     * inheritance. */
    private _scaleY;
    get scaleY(): number;
    set scaleY(scaleY: number);
    /** Sets the skeleton X position, which is added to the root bone worldX position. */
    x: number;
    /** Sets the skeleton Y position, which is added to the root bone worldY position. */
    y: number;
    /** Returns the skeleton's time. This is used for time-based manipulations, such as {@link PhysicsConstraint}.
     * <p>
     * See {@link #update(float)}. */
    time: number;
    constructor(data: SkeletonData);
    /** Caches information about bones and constraints. Must be called if the {@link #getSkin()} is modified or if bones,
     * constraints, or weighted path attachments are added or removed. */
    updateCache(): void;
    sortIkConstraint(constraint: IkConstraint): void;
    sortPathConstraint(constraint: PathConstraint): void;
    sortTransformConstraint(constraint: TransformConstraint): void;
    sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone): void;
    sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone): void;
    sortPhysicsConstraint(constraint: PhysicsConstraint): void;
    sortBone(bone: Bone): void;
    sortReset(bones: Array<Bone>): void;
    /** Updates the world transform for each bone and applies all constraints.
     *
     * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
     * Runtimes Guide. */
    updateWorldTransform(physics: Physics): void;
    updateWorldTransformWith(physics: Physics, parent: Bone): void;
    /** Sets the bones, constraints, and slots to their setup pose values. */
    setToSetupPose(): void;
    /** Sets the bones and constraints to their setup pose values. */
    setBonesToSetupPose(): void;
    /** Sets the slots and draw order to their setup pose values. */
    setSlotsToSetupPose(): void;
    /** @returns May return null. */
    getRootBone(): Bone;
    /** @returns May be null. */
    findBone(boneName: string): Bone;
    /** @returns -1 if the bone was not found. */
    findBoneIndex(boneName: string): number;
    /** Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
     * repeatedly.
     * @returns May be null. */
    findSlot(slotName: string): Slot;
    /** @returns -1 if the bone was not found. */
    findSlotIndex(slotName: string): number;
    /** Sets a skin by name.
     *
     * See {@link #setSkin()}. */
    setSkinByName(skinName: string): void;
    /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#defaultSkin default skin}. If the
     * skin is changed, {@link #updateCache()} is called.
     *
     * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
     * old skin, each slot's setup mode attachment is attached from the new skin.
     *
     * After changing the skin, the visible attachments can be reset to those attached in the setup pose by calling
     * {@link #setSlotsToSetupPose()}. Also, often {@link AnimationState#apply()} is called before the next time the
     * skeleton is rendered to allow any attachment keys in the current animation(s) to hide or show attachments from the new skin.
     * @param newSkin May be null. */
    setSkin(newSkin: Skin): void;
    /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot name and attachment
     * name.
     *
     * See {@link #getAttachment()}.
     * @returns May be null. */
    getAttachmentByName(slotName: string, attachmentName: string): Attachment | null;
    /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot index and
     * attachment name. First the skin is checked and if the attachment was not found, the default skin is checked.
     *
     * See [Runtime skins](http://esotericsoftware.com/spine-runtime-skins) in the Spine Runtimes Guide.
     * @returns May be null. */
    getAttachment(slotIndex: number, attachmentName: string): Attachment | null;
    /** A convenience method to set an attachment by finding the slot with {@link #findSlot()}, finding the attachment with
     * {@link #getAttachment()}, then setting the slot's {@link Slot#attachment}.
     * @param attachmentName May be null to clear the slot's attachment. */
    setAttachment(slotName: string, attachmentName: string): void;
    /** Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
     * than to call it repeatedly.
     * @return May be null. */
    findIkConstraint(constraintName: string): IkConstraint;
    /** Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
     * this method than to call it repeatedly.
     * @return May be null. */
    findTransformConstraint(constraintName: string): TransformConstraint;
    /** Finds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
     * than to call it repeatedly.
     * @return May be null. */
    findPathConstraint(constraintName: string): PathConstraint;
    /** Finds a physics constraint by comparing each physics constraint's name. It is more efficient to cache the results of this
     * method than to call it repeatedly. */
    findPhysicsConstraint(constraintName: string): PhysicsConstraint;
    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose as `{ x: number, y: number, width: number, height: number }`.
     * Note that this method will create temporary objects which can add to garbage collection pressure. Use `getBounds()` if garbage collection is a concern. */
    getBoundsRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
     * @param offset An output value, the distance from the skeleton origin to the bottom left corner of the AABB.
     * @param size An output value, the width and height of the AABB.
     * @param temp Working memory to temporarily store attachments' computed world vertices.
     * @param clipper {@link SkeletonClipping} to use. If <code>null</code>, no clipping is applied. */
    getBounds(offset: Vector2, size: Vector2, temp?: Array<number>, clipper?: SkeletonClipping | null): void;
    /** Increments the skeleton's {@link #time}. */
    update(delta: number): void;
    physicsTranslate(x: number, y: number): void;
    /** Calls {@link PhysicsConstraint#rotate(float, float, float)} for each physics constraint. */
    physicsRotate(x: number, y: number, degrees: number): void;
}
