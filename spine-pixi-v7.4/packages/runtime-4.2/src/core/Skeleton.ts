import { Attachment, ClippingAttachment, MeshAttachment, PathAttachment, RegionAttachment } from './attachments';
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
import { Color, ISkeleton, MathUtils, NumberArrayLike, Physics, Utils, Vector2 } from '@pixi-spine/base';

/** Stores the current pose for a skeleton.
 *
 * See [Instance objects](http://esotericsoftware.com/spine-runtime-architecture#Instance-objects) in the Spine Runtimes Guide.
 * @public
 * */
export class Skeleton implements ISkeleton<SkeletonData, Bone, Slot, Skin> {
    private static quadTriangles = [0, 1, 2, 2, 3, 0];
    static yDown = false;

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
    _updateCache = new Array<Updatable>();

    /** The skeleton's current skin. May be null. */
    skin: Skin | null = null;

    /** The color to tint all the skeleton's attachments. */
    color: Color;

    /** Scales the entire skeleton on the X axis. This affects all bones, even if the bone's transform mode disallows scale
     * inheritance. */
    scaleX = 1;

    /** Scales the entire skeleton on the Y axis. This affects all bones, even if the bone's transform mode disallows scale
     * inheritance. */
    private _scaleY = 1;

    public get scaleY() {
        return Skeleton.yDown ? -this._scaleY : this._scaleY;
    }

    public set scaleY(scaleY: number) {
        this._scaleY = scaleY;
    }

    /** Sets the skeleton X position, which is added to the root bone worldX position. */
    x = 0;

    /** Sets the skeleton Y position, which is added to the root bone worldY position. */
    y = 0;

    /** Returns the skeleton's time. This is used for time-based manipulations, such as {@link PhysicsConstraint}.
     * <p>
     * See {@link #update(float)}. */
    time = 0;

    constructor(data: SkeletonData) {
        if (!data) throw new Error('data cannot be null.');
        this.data = data;

        this.bones = new Array<Bone>();
        for (let i = 0; i < data.bones.length; i++) {
            const boneData = data.bones[i];
            let bone: Bone;

            if (!boneData.parent) bone = new Bone(boneData, this, null);
            else {
                const parent = this.bones[boneData.parent.index];

                bone = new Bone(boneData, this, parent);
                parent.children.push(bone);
            }
            this.bones.push(bone);
        }

        this.slots = new Array<Slot>();
        this.drawOrder = new Array<Slot>();
        for (let i = 0; i < data.slots.length; i++) {
            const slotData = data.slots[i];
            const bone = this.bones[slotData.boneData.index];
            const slot = new Slot(slotData, bone);

            this.slots.push(slot);
            this.drawOrder.push(slot);
        }

        this.ikConstraints = new Array<IkConstraint>();
        for (let i = 0; i < data.ikConstraints.length; i++) {
            const ikConstraintData = data.ikConstraints[i];

            this.ikConstraints.push(new IkConstraint(ikConstraintData, this));
        }

        this.transformConstraints = new Array<TransformConstraint>();
        for (let i = 0; i < data.transformConstraints.length; i++) {
            const transformConstraintData = data.transformConstraints[i];

            this.transformConstraints.push(new TransformConstraint(transformConstraintData, this));
        }

        this.pathConstraints = new Array<PathConstraint>();
        for (let i = 0; i < data.pathConstraints.length; i++) {
            const pathConstraintData = data.pathConstraints[i];

            this.pathConstraints.push(new PathConstraint(pathConstraintData, this));
        }

        this.physicsConstraints = new Array<PhysicsConstraint>();
        console.log("data ", data, data.physicsConstraints);
        for (let i = 0; i < data.physicsConstraints.length; i++) {
            const physicsConstraintData = data.physicsConstraints[i];

            this.physicsConstraints.push(new PhysicsConstraint(physicsConstraintData, this));
        }

        this.color = new Color(1, 1, 1, 1);
        this.updateCache();
    }

    /** Caches information about bones and constraints. Must be called if the {@link #getSkin()} is modified or if bones,
     * constraints, or weighted path attachments are added or removed. */
    updateCache() {
        const updateCache = this._updateCache;

        updateCache.length = 0;

        const bones = this.bones;

        for (let i = 0, n = bones.length; i < n; i++) {
            const bone = bones[i];

            bone.sorted = bone.data.skinRequired;
            bone.active = !bone.sorted;
        }

        if (this.skin) {
            const skinBones = this.skin.bones;

            for (let i = 0, n = this.skin.bones.length; i < n; i++) {
                let bone: Bone | null = this.bones[skinBones[i].index];

                do {
                    bone.sorted = false;
                    bone.active = true;
                    bone = bone.parent;
                } while (bone);
            }
        }

        // IK first, lowest hierarchy depth first.
        const ikConstraints = this.ikConstraints;
        const transformConstraints = this.transformConstraints;
        const pathConstraints = this.pathConstraints;
        const physicsConstraints = this.physicsConstraints;
        const ikCount = ikConstraints.length;
        const transformCount = transformConstraints.length;
        const pathCount = pathConstraints.length;
        const physicsCount = this.physicsConstraints.length;
        const constraintCount = ikCount + transformCount + pathCount + physicsCount;

        outer: for (let i = 0; i < constraintCount; i++) {
            for (let ii = 0; ii < ikCount; ii++) {
                const constraint = ikConstraints[ii];

                if (constraint.data.order == i) {
                    this.sortIkConstraint(constraint);
                    continue outer;
                }
            }
            for (let ii = 0; ii < transformCount; ii++) {
                const constraint = transformConstraints[ii];

                if (constraint.data.order == i) {
                    this.sortTransformConstraint(constraint);
                    continue outer;
                }
            }
            for (let ii = 0; ii < pathCount; ii++) {
                const constraint = pathConstraints[ii];

                if (constraint.data.order == i) {
                    this.sortPathConstraint(constraint);
                    continue outer;
                }
            }
            for (let ii = 0; ii < physicsCount; ii++) {
                const constraint = physicsConstraints[ii];

                if (constraint.data.order == i) {
                    this.sortPhysicsConstraint(constraint);
                    continue outer;
                }
            }
        }

        for (let i = 0, n = bones.length; i < n; i++) this.sortBone(bones[i]);
    }

    sortIkConstraint(constraint: IkConstraint) {
        constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || (this.skin && Utils.contains(this.skin.constraints, constraint.data, true)))!;
        if (!constraint.active) return;

        const target = constraint.target;

        this.sortBone(target);

        const constrained = constraint.bones;
        const parent = constrained[0];

        this.sortBone(parent);

        if (constrained.length == 1) {
            this._updateCache.push(constraint);
            this.sortReset(parent.children);
        } else {
            const child = constrained[constrained.length - 1];

            this.sortBone(child);

            this._updateCache.push(constraint);

            this.sortReset(parent.children);
            child.sorted = true;
        }
    }

    sortPathConstraint(constraint: PathConstraint) {
        constraint.active = constraint.target.bone.isActive() && (!constraint.data.skinRequired || (this.skin && Utils.contains(this.skin.constraints, constraint.data, true)))!;
        if (!constraint.active) return;

        const slot = constraint.target;
        const slotIndex = slot.data.index;
        const slotBone = slot.bone;

        if (this.skin) this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
        if (this.data.defaultSkin && this.data.defaultSkin != this.skin) this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
        for (let i = 0, n = this.data.skins.length; i < n; i++) this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);

        const attachment = slot.getAttachment();

        if (attachment instanceof PathAttachment) this.sortPathConstraintAttachmentWith(attachment, slotBone);

        const constrained = constraint.bones;
        const boneCount = constrained.length;

        for (let i = 0; i < boneCount; i++) this.sortBone(constrained[i]);

        this._updateCache.push(constraint);

        for (let i = 0; i < boneCount; i++) this.sortReset(constrained[i].children);
        for (let i = 0; i < boneCount; i++) constrained[i].sorted = true;
    }

    sortTransformConstraint(constraint: TransformConstraint) {
        constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || (this.skin && Utils.contains(this.skin.constraints, constraint.data, true)))!;
        if (!constraint.active) return;

        this.sortBone(constraint.target);

        const constrained = constraint.bones;
        const boneCount = constrained.length;

        if (constraint.data.local) {
            for (let i = 0; i < boneCount; i++) {
                const child = constrained[i];

                this.sortBone(child.parent!);
                this.sortBone(child);
            }
        } else {
            for (let i = 0; i < boneCount; i++) {
                this.sortBone(constrained[i]);
            }
        }

        this._updateCache.push(constraint);

        for (let i = 0; i < boneCount; i++) this.sortReset(constrained[i].children);
        for (let i = 0; i < boneCount; i++) constrained[i].sorted = true;
    }

    sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone) {
        const attachments = skin.attachments[slotIndex];

        if (!attachments) return;
        for (const key in attachments) {
            this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
        }
    }

    sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone) {
        if (!(attachment instanceof PathAttachment)) return;
        const pathBones = (<PathAttachment>attachment).bones;

        if (!pathBones) this.sortBone(slotBone);
        else {
            const bones = this.bones;

            for (let i = 0, n = pathBones.length; i < n; ) {
                let nn = pathBones[i++];

                nn += i;
                while (i < nn) this.sortBone(bones[pathBones[i++]]);
            }
        }
    }

    sortPhysicsConstraint(constraint: PhysicsConstraint) {
        const bone = constraint.bone;

        constraint.active = bone.active && (!constraint.data.skinRequired || (this.skin != null && Utils.contains(this.skin.constraints, constraint.data, true)));
        if (!constraint.active) return;

        this.sortBone(bone);

        this._updateCache.push(constraint);

        this.sortReset(bone.children);
        bone.sorted = true;
    }

    sortBone(bone: Bone) {
        if (!bone) return;
        if (bone.sorted) return;
        const parent = bone.parent;

        if (parent) this.sortBone(parent);
        bone.sorted = true;
        this._updateCache.push(bone);
    }

    sortReset(bones: Array<Bone>) {
        for (let i = 0, n = bones.length; i < n; i++) {
            const bone = bones[i];

            if (!bone.active) continue;
            if (bone.sorted) this.sortReset(bone.children);
            bone.sorted = false;
        }
    }

    /** Updates the world transform for each bone and applies all constraints.
     *
     * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
     * Runtimes Guide. */
    updateWorldTransform(physics: Physics) {
        if (physics === undefined || physics === null) throw new Error('physics is undefined');
        const bones = this.bones;

        for (let i = 0, n = bones.length; i < n; i++) {
            const bone = bones[i];

            bone.ax = bone.x;
            bone.ay = bone.y;
            bone.arotation = bone.rotation;
            bone.ascaleX = bone.scaleX;
            bone.ascaleY = bone.scaleY;
            bone.ashearX = bone.shearX;
            bone.ashearY = bone.shearY;
        }

        const updateCache = this._updateCache;

        for (let i = 0, n = updateCache.length; i < n; i++) updateCache[i].update(physics);
    }

    updateWorldTransformWith(physics: Physics, parent: Bone) {
        // Apply the parent bone transform to the root bone. The root bone always inherits scale, rotation and reflection.
        const rootBone = this.getRootBone();

        if (!rootBone) throw new Error('Root bone must not be null.');
        const pa = parent.a;
        const pb = parent.b;
        const pc = parent.c;
        const pd = parent.d;

        rootBone.worldX = pa * this.x + pb * this.y + parent.worldX;
        rootBone.worldY = pc * this.x + pd * this.y + parent.worldY;

        const rx = (rootBone.rotation + rootBone.shearX) * MathUtils.degRad;
        const ry = (rootBone.rotation + 90 + rootBone.shearY) * MathUtils.degRad;
        const la = Math.cos(rx) * rootBone.scaleX;
        const lb = Math.cos(ry) * rootBone.scaleY;
        const lc = Math.sin(rx) * rootBone.scaleX;
        const ld = Math.sin(ry) * rootBone.scaleY;

        rootBone.a = (pa * la + pb * lc) * this.scaleX;
        rootBone.b = (pa * lb + pb * ld) * this.scaleX;
        rootBone.c = (pc * la + pd * lc) * this.scaleY;
        rootBone.d = (pc * lb + pd * ld) * this.scaleY;

        // Update everything except root bone.
        const updateCache = this._updateCache;

        for (let i = 0, n = updateCache.length; i < n; i++) {
            const updatable = updateCache[i];

            if (updatable != rootBone) updatable.update(physics);
        }
    }

    /** Sets the bones, constraints, and slots to their setup pose values. */
    setToSetupPose() {
        this.setBonesToSetupPose();
        this.setSlotsToSetupPose();
    }

    /** Sets the bones and constraints to their setup pose values. */
    setBonesToSetupPose() {
        for (const bone of this.bones) bone.setToSetupPose();
        for (const constraint of this.ikConstraints) constraint.setToSetupPose();
        for (const constraint of this.transformConstraints) constraint.setToSetupPose();
        for (const constraint of this.pathConstraints) constraint.setToSetupPose();
        for (const constraint of this.physicsConstraints) constraint.setToSetupPose();
    }

    /** Sets the slots and draw order to their setup pose values. */
    setSlotsToSetupPose() {
        const slots = this.slots;

        Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
        for (let i = 0, n = slots.length; i < n; i++) slots[i].setToSetupPose();
    }

    /** @returns May return null. */
    getRootBone() {
        if (this.bones.length == 0) return null;

        return this.bones[0];
    }

    /** @returns May be null. */
    findBone(boneName: string) {
        if (!boneName) throw new Error('boneName cannot be null.');
        const bones = this.bones;

        for (let i = 0, n = bones.length; i < n; i++) {
            const bone = bones[i];

            if (bone.data.name == boneName) return bone;
        }

        return null;
    }

    /** @returns -1 if the bone was not found. */
    findBoneIndex(boneName: string) {
        if (!boneName) throw new Error('boneName cannot be null.');
        const bones = this.bones;

        for (let i = 0, n = bones.length; i < n; i++) if (bones[i].data.name == boneName) return i;

        return -1;
    }

    /** Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
     * repeatedly.
     * @returns May be null. */
    findSlot(slotName: string) {
        if (!slotName) throw new Error('slotName cannot be null.');
        const slots = this.slots;

        for (let i = 0, n = slots.length; i < n; i++) {
            const slot = slots[i];

            if (slot.data.name == slotName) return slot;
        }

        return null;
    }

    /** @returns -1 if the bone was not found. */
    findSlotIndex(slotName: string) {
        if (!slotName) throw new Error('slotName cannot be null.');
        const slots = this.slots;

        for (let i = 0, n = slots.length; i < n; i++) if (slots[i].data.name == slotName) return i;

        return -1;
    }

    /** Sets a skin by name.
     *
     * See {@link #setSkin()}. */
    setSkinByName(skinName: string) {
        const skin = this.data.findSkin(skinName);

        if (!skin) throw new Error(`Skin not found: ${skinName}`);
        this.setSkin(skin);
    }

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
    setSkin(newSkin: Skin) {
        if (newSkin == this.skin) return;
        if (newSkin) {
            if (this.skin) newSkin.attachAll(this, this.skin);
            else {
                const slots = this.slots;

                for (let i = 0, n = slots.length; i < n; i++) {
                    const slot = slots[i];
                    const name = slot.data.attachmentName;

                    if (name) {
                        const attachment = newSkin.getAttachment(i, name);

                        if (attachment) slot.setAttachment(attachment);
                    }
                }
            }
        }
        this.skin = newSkin;
        this.updateCache();
    }

    /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot name and attachment
     * name.
     *
     * See {@link #getAttachment()}.
     * @returns May be null. */
    getAttachmentByName(slotName: string, attachmentName: string): Attachment | null {
        const slot = this.data.findSlot(slotName);

        if (!slot) throw new Error(`Can't find slot with name ${slotName}`);

        return this.getAttachment(slot.index, attachmentName);
    }

    /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot index and
     * attachment name. First the skin is checked and if the attachment was not found, the default skin is checked.
     *
     * See [Runtime skins](http://esotericsoftware.com/spine-runtime-skins) in the Spine Runtimes Guide.
     * @returns May be null. */
    getAttachment(slotIndex: number, attachmentName: string): Attachment | null {
        if (!attachmentName) throw new Error('attachmentName cannot be null.');
        if (this.skin) {
            const attachment = this.skin.getAttachment(slotIndex, attachmentName);

            if (attachment) return attachment;
        }
        if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);

        return null;
    }

    /** A convenience method to set an attachment by finding the slot with {@link #findSlot()}, finding the attachment with
     * {@link #getAttachment()}, then setting the slot's {@link Slot#attachment}.
     * @param attachmentName May be null to clear the slot's attachment. */
    setAttachment(slotName: string, attachmentName: string) {
        if (!slotName) throw new Error('slotName cannot be null.');
        const slots = this.slots;

        for (let i = 0, n = slots.length; i < n; i++) {
            const slot = slots[i];

            if (slot.data.name == slotName) {
                let attachment: Attachment | null = null;

                if (attachmentName) {
                    attachment = this.getAttachment(i, attachmentName);
                    if (!attachment) throw new Error(`Attachment not found: ${attachmentName}, for slot: ${slotName}`);
                }
                slot.setAttachment(attachment);

                return;
            }
        }
        throw new Error(`Slot not found: ${slotName}`);
    }

    /** Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
     * than to call it repeatedly.
     * @return May be null. */
    findIkConstraint(constraintName: string) {
        if (!constraintName) throw new Error('constraintName cannot be null.');

        return this.ikConstraints.find((constraint) => constraint.data.name == constraintName) ?? null;
    }

    /** Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
     * this method than to call it repeatedly.
     * @return May be null. */
    findTransformConstraint(constraintName: string) {
        if (!constraintName) throw new Error('constraintName cannot be null.');

        return this.transformConstraints.find((constraint) => constraint.data.name == constraintName) ?? null;
    }

    /** Finds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
     * than to call it repeatedly.
     * @return May be null. */
    findPathConstraint(constraintName: string) {
        if (!constraintName) throw new Error('constraintName cannot be null.');

        return this.pathConstraints.find((constraint) => constraint.data.name == constraintName) ?? null;
    }

    /** Finds a physics constraint by comparing each physics constraint's name. It is more efficient to cache the results of this
     * method than to call it repeatedly. */
    findPhysicsConstraint(constraintName: string) {
        if (constraintName == null) throw new Error('constraintName cannot be null.');

        return this.physicsConstraints.find((constraint) => constraint.data.name == constraintName) ?? null;
    }

    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose as `{ x: number, y: number, width: number, height: number }`.
     * Note that this method will create temporary objects which can add to garbage collection pressure. Use `getBounds()` if garbage collection is a concern. */
    getBoundsRect() {
        const offset = new Vector2();
        const size = new Vector2();

        this.getBounds(offset, size);

        return { x: offset.x, y: offset.y, width: size.x, height: size.y };
    }

    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
     * @param offset An output value, the distance from the skeleton origin to the bottom left corner of the AABB.
     * @param size An output value, the width and height of the AABB.
     * @param temp Working memory to temporarily store attachments' computed world vertices.
     * @param clipper {@link SkeletonClipping} to use. If <code>null</code>, no clipping is applied. */
    getBounds(offset: Vector2, size: Vector2, temp: Array<number> = new Array<number>(2), clipper: SkeletonClipping | null = null) {
        if (!offset) throw new Error('offset cannot be null.');
        if (!size) throw new Error('size cannot be null.');
        const drawOrder = this.drawOrder;
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (let i = 0, n = drawOrder.length; i < n; i++) {
            const slot = drawOrder[i];

            if (!slot.bone.active) continue;
            let verticesLength = 0;
            let vertices: NumberArrayLike | null = null;
            let triangles: NumberArrayLike | null = null;
            const attachment = slot.getAttachment();

            if (attachment instanceof RegionAttachment) {
                verticesLength = 8;
                vertices = Utils.setArraySize(temp, verticesLength, 0);
                attachment.computeWorldVertices(slot, vertices, 0, 2);
                triangles = Skeleton.quadTriangles;
            } else if (attachment instanceof MeshAttachment) {
                const mesh = <MeshAttachment>attachment;

                verticesLength = mesh.worldVerticesLength;
                vertices = Utils.setArraySize(temp, verticesLength, 0);
                mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
                triangles = mesh.triangles;
            } else if (attachment instanceof ClippingAttachment && clipper != null) {
                clipper.clipStart(slot, attachment);
                continue;
            }
            if (vertices && triangles) {
                if (clipper != null && clipper.isClipping()) {
                    clipper.clipTriangles(vertices, triangles, triangles.length);
                    vertices = clipper.clippedVertices;
                    verticesLength = clipper.clippedVertices.length;
                }
                for (let ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                    const x = vertices[ii];
                    const y = vertices[ii + 1];

                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
            if (clipper != null) clipper.clipEndWithSlot(slot);
        }
        if (clipper != null) clipper.clipEnd();
        offset.set(minX, minY);
        size.set(maxX - minX, maxY - minY);
    }

    /** Increments the skeleton's {@link #time}. */
    update(delta: number) {
        this.time += delta;
    }

    physicsTranslate(x: number, y: number) {
        const physicsConstraints = this.physicsConstraints;

        for (let i = 0, n = physicsConstraints.length; i < n; i++) physicsConstraints[i].translate(x, y);
    }

    /** Calls {@link PhysicsConstraint#rotate(float, float, float)} for each physics constraint. */
    physicsRotate(x: number, y: number, degrees: number) {
        const physicsConstraints = this.physicsConstraints;

        for (let i = 0, n = physicsConstraints.length; i < n; i++) physicsConstraints[i].rotate(x, y, degrees);
    }
}
