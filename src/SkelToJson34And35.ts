import { BinaryInput } from './BinaryInput';
import { readSkin, readAnimation } from './SkelToJsonCommon';
import { SpineSkeletonData, BoneData, SlotData, IkConstraintData, TransformConstraintData, PathConstraintData, SkinData } from './types';

/**
 * Spine v3.4/v3.5 二进制数据解析模块
 */

/**
 * 从二进制数据解析为 v3.4/v3.5 JSON 结构对象
 * @param binary - 二进制字节数据
 * @returns JSON 结构对象
 */
export function readSkeletonData34And35(binary: ArrayBuffer): SpineSkeletonData {
    const skeletonData: SpineSkeletonData = {};
    const input = new BinaryInput(binary);
    const skeleton = {
        hash: input.readString() || '',
        spine: input.readString() || '',
        width: input.readFloat(),
        height: input.readFloat(),
        fps: undefined as number | undefined,
        images: undefined as string | undefined,
    };
    const isSpine35 = skeleton.spine.startsWith('3.5');

    const nonessential = input.readBoolean();
    if (nonessential) {
        if (isSpine35) {
            skeleton.fps = input.readFloat();
        }
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
        const parentIndex = i === 0 ? null : input.readVarint(true);
        if (parentIndex !== null && skeletonData.bones[parentIndex]) {
            data.parent = skeletonData.bones[parentIndex].name;
        }
        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearX = input.readFloat();
        data.shearY = input.readFloat();
        data.length = input.readFloat();

        const key = ['rotation', 'x', 'y', 'shearX', 'shearY', 'length'] as const;
        key.forEach((e) => {
            if (data[e] === 0) {
                delete data[e];
            }
        });
        const key2 = ['scaleX', 'scaleY'] as const;
        key2.forEach((e) => {
            if (data[e] === 1) {
                delete data[e];
            }
        });

        if (isSpine35) {
            const transformMode = [
                'normal',
                'onlytranslation',
                'norotationorreflection',
                'noscale',
                'noscaleorreflection',
            ];
            data.transform = transformMode[input.readVarint(true)];
        } else {
            data.inheritRotation = input.readBoolean();
            data.inheritScale = input.readBoolean();
        }

        if (nonessential) {
            data.color = input.readColorHex();
        }
        skeletonData.bones.push(data);
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
        if (isSpine35) {
            data.order = input.readVarint(true);
        }
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

    /* Transform constraints. */
    const transformConstraintsCount = input.readVarint(true);
    skeletonData.transform = new Array(transformConstraintsCount);
    for (let i = 0; i < transformConstraintsCount; ++i) {
        const data: TransformConstraintData = {
            name: input.readString() || '',
            bones: [],
            target: '',
            rotation: 0,
            x: 0,
            y: 0,
            scaleX: 0,
            scaleY: 0,
            shearY: 0,
            rotateMix: 0,
            translateMix: 0,
            scaleMix: 0,
            shearMix: 0,
        };
        if (isSpine35) {
            data.order = input.readVarint(true);
        }
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

        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        if (!data.x) delete (data as any).x;
        if (!data.y) delete (data as any).y;
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearY = input.readFloat();
        data.rotateMix = input.readFloat();
        data.translateMix = input.readFloat();
        data.scaleMix = input.readFloat();
        data.shearMix = input.readFloat();

        skeletonData.transform[i] = data;
    }

    /* Path constraints */
    const pathConstraintsCount = input.readVarint(true);
    skeletonData.path = new Array(pathConstraintsCount);
    for (let i = 0; i < pathConstraintsCount; ++i) {
        const name = input.readString() || '';
        const data: PathConstraintData = {
            name: name,
            bones: [],
            target: '',
            positionMode: 'fixed',
            spacingMode: 'length',
            rotateMode: 'tangent',
            rotation: 0,
            position: 0,
            spacing: 0,
            rotateMix: 0,
            translateMix: 0,
        };
        if (isSpine35) {
            data.order = input.readVarint(true);
        }
        const bonesCount = input.readVarint(true);
        data.bones = new Array(bonesCount);
        for (let ii = 0; ii < bonesCount; ++ii) {
            if (skeletonData.bones) {
                data.bones[ii] = skeletonData.bones[input.readVarint(true)].name;
            }
        }
        if (skeletonData.slots) {
            data.target = skeletonData.slots[input.readVarint(true)].name;
        }
        data.positionMode = ['fixed', 'percent'][input.readVarint(true)] as any;
        data.spacingMode = ['length', 'fixed', 'percent'][input.readVarint(true)] as any;
        data.rotateMode = ['tangent', 'chain', 'chainScale'][input.readVarint(true)] as any;
        data.rotation = input.readFloat();
        data.position = input.readFloat();
        data.spacing = input.readFloat();
        data.rotateMix = input.readFloat();
        data.translateMix = input.readFloat();

        skeletonData.path[i] = data;

        Object.keys(data).forEach((e) => {
            if ((data as any)[e] === 0) {
                delete (data as any)[e];
            }
        });
    }

    /* Skins. */
    skeletonData.skins = {};
    const skins: { name: string; data: SkinData | null }[] = [];
    const defaultSkin = readSkin(input, skeletonData, nonessential);
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
        const skinData = readSkin(input, skeletonData, nonessential);
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
            intValue: input.readVarint(false),
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
        const animation = readAnimation(input, skeletonData, skins);
        if (!animation) {
            throw new Error('读取动画列表时出现错误');
        }
        skeletonData.animations[name] = animation;
    }
    return skeletonData;
}
