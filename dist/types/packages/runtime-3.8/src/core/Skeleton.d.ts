import { Attachment } from './attachments';
import { Bone } from './Bone';
import { Slot } from './Slot';
import type { Updatable } from './Updatable';
import type { SkeletonData } from './SkeletonData';
import { IkConstraint } from './IkConstraint';
import { TransformConstraint } from './TransformConstraint';
import { PathConstraint } from './PathConstraint';
import type { Skin } from './Skin';
import { Color, Vector2, ISkeleton } from '@pixi-spine/base';
/**
 * @public
 */
export declare class Skeleton implements ISkeleton<SkeletonData, Bone, Slot, Skin> {
    data: SkeletonData;
    bones: Array<Bone>;
    slots: Array<Slot>;
    drawOrder: Array<Slot>;
    ikConstraints: Array<IkConstraint>;
    transformConstraints: Array<TransformConstraint>;
    pathConstraints: Array<PathConstraint>;
    _updateCache: Updatable[];
    updateCacheReset: Updatable[];
    skin: Skin;
    color: Color;
    time: number;
    scaleX: number;
    scaleY: number;
    x: number;
    y: number;
    constructor(data: SkeletonData);
    updateCache(): void;
    sortIkConstraint(constraint: IkConstraint): void;
    sortPathConstraint(constraint: PathConstraint): void;
    sortTransformConstraint(constraint: TransformConstraint): void;
    sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone): void;
    sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone): void;
    sortBone(bone: Bone): void;
    sortReset(bones: Array<Bone>): void;
    /** Updates the world transform for each bone and applies constraints. */
    updateWorldTransform(): void;
    /** Sets the bones, constraints, and slots to their setup pose values. */
    setToSetupPose(): void;
    /** Sets the bones and constraints to their setup pose values. */
    setBonesToSetupPose(): void;
    setSlotsToSetupPose(): void;
    /** @return May return null. */
    getRootBone(): Bone;
    /** @return May be null. */
    findBone(boneName: string): Bone;
    /** @return -1 if the bone was not found. */
    findBoneIndex(boneName: string): number;
    /** @return May be null. */
    findSlot(slotName: string): Slot;
    /** @return -1 if the bone was not found. */
    findSlotIndex(slotName: string): number;
    /** Sets a skin by name.
     * @see #setSkin(Skin) */
    setSkinByName(skinName: string): void;
    /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
     * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
     * old skin, each slot's setup mode attachment is attached from the new skin.
     * @param newSkin May be null. */
    setSkin(newSkin: Skin): void;
    /** @return May be null. */
    getAttachmentByName(slotName: string, attachmentName: string): Attachment;
    /** @return May be null. */
    getAttachment(slotIndex: number, attachmentName: string): Attachment;
    /** @param attachmentName May be null. */
    setAttachment(slotName: string, attachmentName?: string): void;
    /** @return May be null. */
    findIkConstraint(constraintName: string): IkConstraint;
    /** @return May be null. */
    findTransformConstraint(constraintName: string): TransformConstraint;
    /** @return May be null. */
    findPathConstraint(constraintName: string): PathConstraint;
    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
     * @param offset The distance from the skeleton origin to the bottom left corner of the AABB.
     * @param size The width and height of the AABB.
     * @param temp Working memory */
    getBounds(offset: Vector2, size: Vector2, temp?: Array<number>): void;
    update(delta: number): void;
    get flipX(): boolean;
    set flipX(value: boolean);
    get flipY(): boolean;
    set flipY(value: boolean);
    private static deprecatedWarning1;
}
