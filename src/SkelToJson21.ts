import { BinaryInput } from './BinaryInput';
import { readVertices } from './SkelToJsonCommon';
import { SpineSkeletonData, BoneData, SlotData, IkConstraintData, SkinData, AttachmentData } from './types';

/**
 * Spine v2.0/v2.1 二进制数据解析模块
 */

/**
 * 从二进制数据解析为 v2.0/v2.1 JSON 结构对象
 * @param binary - 二进制字节数据
 * @returns JSON 结构对象
 */
export function readSkeletonData21(binary: ArrayBuffer): SpineSkeletonData {
    const skeletonData: SpineSkeletonData = {};
    const input = new BinaryInput(binary);
    const skeleton = {
        hash: input.readString() || '',
        spine: input.readString() || '',
        width: input.readFloat(),
        height: input.readFloat(),
        images: undefined as string | undefined,
    };

    const nonessential = input.readBoolean();
    if (nonessential) {
        skeleton.images = input.readString() || undefined;
    }
    skeletonData.skeleton = skeleton;

    /* Bones. */
    const bonesCount = input.readVarint(true);
    skeletonData.bones = [];
    for (let i = 0; i < bonesCount; i++) {
        const data: BoneData = {
            name: input.readString() || '',
            parent: null,
        };
        const parentIndex = input.readVarint(true) - 1;
        if (parentIndex !== -1 && skeletonData.bones[parentIndex]) {
            data.parent = skeletonData.bones[parentIndex].name;
        }
        data.x = input.readFloat();
        data.y = input.readFloat();
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.rotation = input.readFloat();
        data.length = input.readFloat();
        (data as any).flipX = input.readBoolean();
        (data as any).flipY = input.readBoolean();
        data.inheritScale = input.readBoolean();
        data.inheritRotation = input.readBoolean();

        const key = ['rotation', 'x', 'y', 'length', 'flipX', 'flipY'] as const;
        key.forEach((e) => {
            if ((data as any)[e] === 0) {
                delete (data as any)[e];
            }
        });
        const key2 = ['scaleX', 'scaleY'] as const;
        key2.forEach((e) => {
            if (data[e] === 1) {
                delete data[e];
            }
        });

        if (nonessential) {
            data.color = input.readColorHex();
        }
        skeletonData.bones.push(data);
    }

    /* IK constraints. */
    const ikConstraintsCount = input.readVarint(true);
    skeletonData.ik = new Array(ikConstraintsCount);
    for (let i = 0; i < ikConstraintsCount; ++i) {
        const data: IkConstraintData = {
            name: input.readString() || '',
            bones: [],
            target: '',
            mix: 0,
            bendPositive: false,
        };
        const bonesCount = input.readVarint(true);
        data.bones = new Array(bonesCount);
        for (let ii = 0; ii < bonesCount; ++ii) {
            if (skeletonData.bones) {
                data.bones[ii] = skeletonData.bones[input.readVarint(true)].name;
            }
        }
        if (skeletonData.bones) {
            data.target = skeletonData.bones[input.readVarint(true)].name;
        }
        data.mix = input.readFloat();
        data.bendPositive = input.readByte() !== 255;
        skeletonData.ik[i] = data;
    }

    /* Slots. */
    skeletonData.slots = [];
    const slotsCount = input.readVarint(true);
    for (let i = 0; i < slotsCount; ++i) {
        const slotName = input.readString() || '';
        const boneIndex = input.readVarint(true);
        const boneData = skeletonData.bones[boneIndex];

        const slotData: SlotData = {
            name: slotName,
            bone: boneData ? boneData.name : '',
        };

        const color = input.readColorHex();
        if (color !== 'ffffffff') {
            slotData.color = color;
        }
        slotData.attachment = input.readString() || undefined;
        slotData.blend = ['normal', 'additive', 'multiply', 'screen'][input.readVarint(true)] as any;
        skeletonData.slots[i] = slotData;
    }

    /* Skins. */
    skeletonData.skins = {};
    const skins: { name: string; data: SkinData | null }[] = [];
    const defaultSkin = readSkin21(input, skeletonData, nonessential);
    (skeletonData.skins as any).default = defaultSkin;
    skins.push({
        name: 'default',
        data: defaultSkin,
    });

    let skinsCount = input.readVarint(true);
    if (skeletonData.defaultSkin) {
        skinsCount++;
    }
    if (skeletonData.defaultSkin) {
        (skeletonData.skins as any).default = skeletonData.defaultSkin;
    }

    for (let i = skeletonData.defaultSkin ? 1 : 0; i < skinsCount; ++i) {
        const skinName = input.readString() || '';
        const skinData = readSkin21(input, skeletonData, nonessential);
        (skeletonData.skins as any)[skinName] = skinData;
        skins.push({
            name: skinName,
            data: skinData,
        });
    }

    /* Events. */
    const eventsCount = input.readVarint(true);
    skeletonData.events = {};
    for (let i = 0; i < eventsCount; ++i) {
        const name = input.readString() || '';
        const eventData = {
            intValue: input.readVarint(0),
            floatValue: input.readFloat(),
            stringValue: input.readString() || undefined,
        };
        skeletonData.events[name] = eventData;
    }

    /* Animations. */
    const animationsCount = input.readVarint(true);
    skeletonData.animations = {};
    for (let i = 0; i < animationsCount; ++i) {
        const name = input.readString() || '';
        const animation = readAnimation21(input, skeletonData, skins);
        if (!animation) {
            throw new Error('读取动画列表时出现错误');
        }
        skeletonData.animations[name] = animation;
    }
    return skeletonData;
}

/**
 * 解析单个 Skin 数据 (v2.1)
 */
function readSkin21(input: BinaryInput, skeletonData: SpineSkeletonData, nonessential: boolean): SkinData | null {
    const slotCount = input.readVarint(true);
    if (slotCount === 0) {
        return null;
    }
    const skin: SkinData = {};
    for (let i = 0; i < slotCount; ++i) {
        const slotIndex = input.readVarint(true);
        const nn = input.readVarint(true);
        const slot: { [attachmentName: string]: AttachmentData } = {};
        for (let ii = 0; ii < nn; ++ii) {
            const name = input.readString();
            if (name) {
                const attachment = readAttachment21(input, name, skeletonData, nonessential);
                if (attachment) {
                    slot[name] = attachment;
                }
            }
        }
        if (skeletonData.slots && skeletonData.slots[slotIndex]) {
            skin[skeletonData.slots[slotIndex].name] = slot;
        }
    }
    return skin;
}

/**
 * 解析单个 Attachment 数据 (v2.1)
 */
function readAttachment21(
    input: BinaryInput,
    attachmentName: string,
    skeletonData: SpineSkeletonData,
    nonessential: boolean
): AttachmentData | null {
    const ATTACHMENT_TYPES = ['region', 'boundingbox', 'mesh', 'linkedmesh', 'path', 'point', 'clipping'] as const;
    const name = input.readString() || attachmentName;
    const type = input.readByte();
    if (type >= ATTACHMENT_TYPES.length) {
        console.warn(`Invalid attachment type: ${type}`);
        return null;
    }
    const attachment: AttachmentData = {
        name,
        type: ATTACHMENT_TYPES[type],
        path: type <= 3 ? input.readString() || name : undefined,
    };

    switch (type) {
        case 0: // REGION
            Object.assign(attachment, {
                x: input.readFloat(),
                y: input.readFloat(),
                scaleX: input.readFloat(),
                scaleY: input.readFloat(),
                rotation: input.readFloat(),
                width: input.readFloat(),
                height: input.readFloat(),
                color: input.readColorHex(),
            });
            break;

        case 1: // BOUNDING_BOX
            attachment.vertices = input.readFloatArray();
            break;

        case 2: // MESH
            Object.assign(attachment, {
                uvs: input.readFloatArray(),
                triangles: input.readShortArray(),
                vertices: input.readFloatArray(),
                color: input.readColorHex(),
                hull: input.readVarint(true),
                ...(nonessential && {
                    edges: input.readIntArray(),
                    width: input.readFloat(),
                    height: input.readFloat(),
                }),
            });
            break;

        case 3: // SKINNED_MESH
            attachment.uvs = input.readFloatArray();
            attachment.triangles = input.readShortArray();
            attachment.vertices = readSkinnedVertices21(input);
            attachment.color = input.readColorHex();
            attachment.hull = input.readVarint(true);
            if (nonessential) {
                attachment.edges = input.readIntArray();
                (attachment as any).size = {
                    width: input.readFloat(),
                    height: input.readFloat(),
                };
            }
            break;

        case 4: {
            // PATH
            attachment.closed = input.readBoolean();
            attachment.constantSpeed = input.readBoolean();
            const vertexCount = input.readVarint(true);
            readVertices(input, attachment, vertexCount);
            if (attachment.vertices) {
                attachment.lengths = input.readFloatArray(Math.ceil(attachment.vertices.length / 3));
            }
            if (nonessential) {
                attachment.color = input.readColorHex();
            }
            break;
        }

        case 6: {
            // CLIPPING
            const endSlotIndex = input.readVarint(true);
            const vertexCount = input.readVarint(true);
            readVertices(input, attachment, vertexCount);
            if (skeletonData.slots && skeletonData.slots[endSlotIndex]) {
                attachment.end = skeletonData.slots[endSlotIndex].name;
            }
            if (nonessential) attachment.color = input.readColorHex();
            break;
        }
    }

    return attachment;
}

/**
 * 读取蒙皮顶点 (v2.1)
 */
function readSkinnedVertices21(input: BinaryInput): number[] {
    const vertices: number[] = [];
    const vertexCount = input.readVarint(true);

    for (let i = 0; i < vertexCount; ) {
        const boneCount = Math.floor(input.readFloat());
        vertices[i++] = boneCount;

        for (let end = i + boneCount * 4; i < end; i += 4) {
            vertices[i] = Math.floor(input.readFloat()); // boneIndex
            vertices[i + 1] = input.readFloat(); // x
            vertices[i + 2] = input.readFloat(); // y
            vertices[i + 3] = input.readFloat(); // weight
        }
    }
    return vertices;
}

/**
 * 解析动画数据 (v2.1)
 */
function readAnimation21(input: BinaryInput, skeletonData: SpineSkeletonData, skins: { name: string; data: SkinData | null }[]): any {
    const scale = 1; // Default scaling factor to prevent ReferenceError
    const animationData: any = {};
    let duration = 0;

    // 1. Slot timelines
    const slotData: any = {};
    const slotCount = input.readVarint(true);

    for (let i = 0; i < slotCount; i++) {
        const slotIndex = input.readVarint(true);
        const timelineMap: any = {};
        const timelineCount = input.readVarint(true);

        for (let ii = 0; ii < timelineCount; ii++) {
            const timelineType = input.readByte();
            const frameCount = input.readVarint(true);
            const timeline = new Array(frameCount);

            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                const time = input.readFloat();
                timeline[frameIndex] = { time };

                switch (timelineType) {
                    case 3: // TIMELINE_ATTACHMENT
                        timeline[frameIndex].name = input.readString();
                        break;

                    case 4: // TIMELINE_COLOR
                        timeline[frameIndex].color = input.readColorHex();
                        if (frameIndex < frameCount - 1) {
                            input.readCurve();
                        }
                        break;

                    default:
                        if (skeletonData.slots && skeletonData.slots[slotIndex]) {
                            console.error(
                                `Invalid timeline type ${timelineType} for slot: ${skeletonData.slots[slotIndex].name}`,
                            );
                        }
                        return null;
                }
            }
            timelineMap[timelineType === 3 ? 'attachment' : 'color'] = timeline;
            duration = Math.max(duration, timeline[frameCount - 1].time);
        }

        if (skeletonData.slots && skeletonData.slots[slotIndex]) {
            slotData[skeletonData.slots[slotIndex].name] = timelineMap;
        }
    }
    animationData.slots = slotData;

    // 2. Bone timelines
    const boneData: any = {};
    const boneCount = input.readVarint(true);

    for (let i = 0; i < boneCount; i++) {
        const boneIndex = input.readVarint(true);
        const timelines: any = {};
        const timelineCount = input.readVarint(true);

        for (let ii = 0; ii < timelineCount; ii++) {
            const type = input.readByte();
            const frameCount = input.readVarint(true);
            const timeline = new Array(frameCount);

            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                const frame: any = { time: input.readFloat() };

                switch (type) {
                    case 1: // ROTATE
                        frame.angle = input.readFloat();
                        break;

                    case 2: // TRANSLATE
                    case 0: // SCALE
                        frame.x = input.readFloat();
                        frame.y = input.readFloat();
                        break;

                    case 5: // FLIPX
                    case 6: // FLIPY
                        frame[type === 5 ? 'x' : 'y'] = input.readBoolean();
                        break;

                    default:
                        if (skeletonData.bones && skeletonData.bones[boneIndex]) {
                            console.error(`Invalid bone timeline type ${type} for: ${skeletonData.bones[boneIndex].name}`);
                        }
                        return null;
                }

                if (frameIndex < frameCount - 1) {
                    const curve = input.readCurve();
                    if (curve) frame.curve = curve;
                }

                timeline[frameIndex] = frame;
                duration = Math.max(duration, frame.time);
            }
            timelines[
                type === 1 ? 'rotate' : type === 0 ? 'scale' : type === 2 ? 'translate' : type === 5 ? 'flipX' : 'flipY'
            ] = timeline;
        }

        if (skeletonData.bones && skeletonData.bones[boneIndex]) {
            boneData[skeletonData.bones[boneIndex].name] = timelines;
        }
    }
    animationData.bones = boneData;

    // 3. IK timelines
    const ikData: any = {};
    const ikCount = input.readVarint(true);

    for (let i = 0; i < ikCount; i++) {
        const constraintIndex = input.readVarint(true);
        const frameCount = input.readVarint(true);
        const timeline = new Array(frameCount);
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frame: any = {
                time: input.readFloat(),
                mix: input.readFloat(),
                bendPositive: input.readByte() !== 0xff,
            };
            if (frameIndex < frameCount - 1) {
                const curve = input.readCurve();
                if (curve) frame.curve = curve;
            }
            timeline[frameIndex] = frame;
        }
        if (skeletonData.ik && skeletonData.ik[constraintIndex]) {
            ikData[skeletonData.ik[constraintIndex].name] = timeline;
        } else {
            console.warn(`Missing IK constraint index: ${constraintIndex}`);
        }
    }

    // 4. FFD timelines.
    const ffd: any = {};
    const ffdCount = input.readVarint(true);
    for (let i = 0; i < ffdCount; i++) {
        const skinIndex = input.readVarint(true);
        const slotMap: any = {};
        const slotCount = input.readVarint(true);
        for (let ii = 0; ii < slotCount; ii++) {
            const slotIndex = input.readVarint(true);
            const meshMap: any = {};
            const meshCount = input.readVarint(true);
            for (let iii = 0; iii < meshCount; iii++) {
                const meshName = input.readString();
                if (meshName) {
                    const frameCount = input.readVarint(true);

                    let attachment: any;
                    const skinsMap: any = skeletonData.skins;
                    const attachments = skinsMap[skins[skinIndex].name][(skeletonData.slots as any)[slotIndex].name];
                    for (const attachmentName in attachments) {
                        if (attachments[attachmentName].name === meshName) {
                            attachment = attachments[attachmentName];
                        }
                    }
                    if (!attachment) {
                        console.log('FFD attachment not found: ' + meshName);
                    }

                    const timeline = new Array(frameCount);
                    for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                        const time = input.readFloat();
                        let vertexCount: number;
                        if (attachment.type === 'mesh') {
                            vertexCount = attachment.vertices.length;
                        } else {
                            vertexCount = attachment.uvs.length * 3 * 3;
                        }

                        const vertices = new Array(vertexCount);
                        for (let verticeIdx = 0; verticeIdx < vertexCount; verticeIdx++) {
                            vertices[verticeIdx] = 0.0;
                        }
                        const bugFixMultiplicator = 0.1;

                        let end = input.readVarint(true);
                        if (end === 0) {
                            if (attachment.type === 'mesh') {
                                for (let verticeIdx = 0; verticeIdx < vertexCount; verticeIdx++) {
                                    vertices[verticeIdx] += attachment.vertices[verticeIdx] * bugFixMultiplicator;
                                }
                            }
                        } else {
                            const start = input.readVarint(true);
                            end += start;

                            for (let v = start; v < end; v++) {
                                vertices[v] = input.readFloat() * scale;
                            }

                            if (attachment.type === 'mesh') {
                                const meshVertices = attachment.vertices;
                                for (let v = 0, vn = vertices.length; v < vn; v++) {
                                    vertices[v] += meshVertices[v] * bugFixMultiplicator;
                                }
                            }
                        }
                        timeline[frameIndex] = {
                            time: time,
                            vertices: vertices,
                        };
                        if (frameIndex < frameCount - 1) {
                            input.readCurve();
                        }
                    }
                    meshMap[meshName] = timeline;
                    duration = Math.max(duration, timeline[frameCount - 1].time);
                }
            }
            if (skeletonData.slots && skeletonData.slots[slotIndex]) {
                slotMap[skeletonData.slots[slotIndex].name] = meshMap;
            }
        }
        ffd[skins[skinIndex].name] = slotMap;
    }
    animationData.ffd = ffd;

    // 5. Draw order timeline.
    const drawOrderCount = input.readVarint(true);
    if (drawOrderCount) {
        const drawOrders: any[] = [];
        for (let i = 0; i < drawOrderCount; ++i) {
            const drawOrderMap: any = {};
            const offsetCount = input.readVarint(true);
            const offsets: any[] = [];
            for (let ii = 0; ii < offsetCount; ++ii) {
                const slotIndex = input.readVarint(true);
                if (skeletonData.slots && skeletonData.slots[slotIndex]) {
                    const data = {
                        slot: skeletonData.slots[slotIndex].name,
                        offset: input.readVarint(true),
                    };
                    offsets.push(data);
                }
            }
            drawOrderMap.offsets = offsets;
            const time = input.readFloat();
            drawOrderMap.time = time;
            drawOrders.push(drawOrderMap);
        }
        duration = Math.max(duration, drawOrders[drawOrderCount - 1].time);
        animationData.drawOrder = drawOrders;
    }

    // 6. Event timeline.
    const eventCount = input.readVarint(true);
    if (eventCount && skeletonData.events) {
        const timeline: any[] = [];
        const eventKeys = Object.keys(skeletonData.events);
        for (let i = 0; i < eventCount; ++i) {
            const time = input.readFloat();
            const name = eventKeys[input.readVarint(true)];
            const event = {
                int: input.readVarint(0),
                float: input.readFloat(),
                string: input.readBoolean() ? input.readString() : name,
                time: time,
                name: name,
            };
            timeline.push(event);
        }
        animationData.events = timeline;
        duration = Math.max(duration, timeline[eventCount - 1].time);
    }

    // 清理空对象键
    Object.keys(animationData).forEach((key) => {
        if (Object.keys(animationData[key]).length === 0) {
            delete animationData[key];
        }
    });

    return animationData;
}
