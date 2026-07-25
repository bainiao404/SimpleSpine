/**
 * Spine v3.6/v3.7 二进制数据解析模块
 */
import { BinaryInput } from './BinaryInput.js'
import { readSkin, readAnimation } from './SkelToJsonCommon.js'

/**
 * 从二进制数据解析为 v3.6/v3.7 JSON 结构对象
 * @param {ArrayBuffer} binary - 二进制字节数据
 * @returns {object} JSON 结构对象
 */
export function readSkeletonData36And37(binary) {
    const skeletonData = {}
    const input = new BinaryInput(binary)
    const skeleton = {
        hash: input.readString(),
        spine: input.readString(),
        width: input.readFloat(),
        height: input.readFloat(),
    }
    const version = skeleton.spine.startsWith('3.7') ? 37 : 36

    const nonessential = input.readBoolean()
    if (nonessential) {
        skeleton.fps = input.readFloat()
        skeleton.images = input.readString()
        if (version === 37) {
            input.readString()
        }
    }
    skeletonData.skeleton = skeleton

    /* Bones. */
    const bonesCount = input.readVarint(true)
    skeletonData.bones = []
    for (let i = 0; i < bonesCount; i++) {
        const data = {
            name: input.readString(),
            parent: null,
        }
        const parentIndex = i === 0 ? null : input.readVarint(true)
        if (parentIndex !== null) {
            data.parent = skeletonData.bones[parentIndex].name
        }
        data.rotation = input.readFloat()
        data.x = input.readFloat()
        data.y = input.readFloat()
        data.scaleX = input.readFloat()
        data.scaleY = input.readFloat()
        data.shearX = input.readFloat()
        data.shearY = input.readFloat()
        data.length = input.readFloat()

        const key = ['rotation', 'x', 'y', 'shearX', 'shearY', 'length']
        key.forEach((e) => {
            if (data[e] === 0) {
                delete data[e]
            }
        })
        const key2 = ['scaleX', 'scaleY']
        key2.forEach((e) => {
            if (data[e] === 1) {
                delete data[e]
            }
        })

        const transformMode = ['normal', 'onlytranslation', 'norotationorreflection', 'noscale', 'noscaleorreflection']
        data.transform = transformMode[input.readVarint(true)]

        if (nonessential) {
            data.color = input.readColorHex()
        }
        skeletonData.bones.push(data)
    }

    /* Slots. */
    skeletonData.slots = []
    const slotsCount = input.readVarint(true)
    for (let i = 0; i < slotsCount; ++i) {
        const slotName = input.readString()
        const boneIndex = input.readVarint(true)
        const boneData = skeletonData.bones[boneIndex]

        const slotData = {
            name: slotName,
            bone: boneData.name,
        }

        const color = input.readColorHex()
        if (color !== 'ffffffff') {
            slotData.color = color
        }
        const dark = input.readColorHex()
        if (dark !== 'ffffffff') {
            slotData.dark = dark
        }
        slotData.attachment = input.readString()
        slotData.blend = ['normal', 'additive', 'multiply', 'screen'][input.readVarint(true)]
        skeletonData.slots[i] = slotData
    }

    /* IK constraints. */
    const ikConstraintsCount = input.readVarint(true)
    skeletonData.ik = new Array(ikConstraintsCount)
    for (let i = 0; i < ikConstraintsCount; ++i) {
        const data = {
            name: input.readString(),
        }
        data.order = input.readVarint(true)
        const bonesCount = input.readVarint(true)
        data.bones = new Array(bonesCount)
        for (let ii = 0; ii < bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(true)].name
        }
        data.target = skeletonData.bones[input.readVarint(true)].name
        data.mix = input.readFloat()
        data.bendPositive = input.readByte() !== 255

        if (skeletonData.skeleton.spine.startsWith('3.7')) {
            data.compress = input.readBoolean()
            data.stretch = input.readBoolean()
            data.uniform = input.readBoolean()
        }
        skeletonData.ik[i] = data
    }

    /* Transform constraints. */
    const transformConstraintsCount = input.readVarint(true)
    skeletonData.transform = new Array(transformConstraintsCount)
    for (let i = 0; i < transformConstraintsCount; ++i) {
        const data = {
            name: input.readString(),
        }
        data.order = input.readVarint(true)
        data.bonesCount = input.readVarint(true)
        data.bones = new Array(data.bonesCount)
        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(true)].name
        }
        data.target = skeletonData.bones[input.readVarint(true)].name
        data.local = input.readBoolean()
        data.relative = input.readBoolean()
        data.rotation = input.readFloat()
        data.x = input.readFloat()
        data.y = input.readFloat()
        if (!data.x) delete data.x
        if (!data.y) delete data.y
        data.scaleX = input.readFloat()
        data.scaleY = input.readFloat()
        data.shearY = input.readFloat()
        data.rotateMix = input.readFloat()
        data.translateMix = input.readFloat()
        data.scaleMix = input.readFloat()
        data.shearMix = input.readFloat()

        skeletonData.transform[i] = data
    }

    /* Path constraints */
    const pathConstraintsCount = input.readVarint(true)
    skeletonData.path = new Array(pathConstraintsCount)
    for (let i = 0; i < pathConstraintsCount; ++i) {
        const name = input.readString()
        const data = {
            name: name,
        }
        data.order = input.readVarint(true)
        data.bonesCount = input.readVarint(true)
        data.bones = new Array(data.bonesCount)
        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(true)].name
        }
        data.target = skeletonData.slots[input.readVarint(true)].name
        data.positionMode = ['fixed', 'percent'][input.readVarint(true)]
        data.spacingMode = ['length', 'fixed', 'percent'][input.readVarint(true)]
        data.rotateMode = ['tangent', 'chain', 'chainScale'][input.readVarint(true)]
        data.rotation = input.readFloat()
        data.position = input.readFloat()
        data.spacing = input.readFloat()
        data.rotateMix = input.readFloat()
        data.translateMix = input.readFloat()

        skeletonData.path[i] = data
    }

    /* Skins. */
    skeletonData.skins = {}
    const skins = []
    skeletonData.skins.default = readSkin(input, skeletonData, nonessential)
    skins.push({
        name: 'default',
        data: skeletonData.skins.default,
    })

    const skinsCount = input.readVarint(true)

    for (let i = 0; i < skinsCount; ++i) {
        const skinName = input.readString()
        skeletonData.skins[skinName] = readSkin(input, skeletonData, nonessential)
        skins.push({
            name: skinName,
            data: skeletonData.skins[skinName],
        })
    }

    /* Events. */
    const eventsCount = input.readVarint(true)
    skeletonData.events = {}
    for (let i = 0; i < eventsCount; ++i) {
        const name = input.readString()
        const eventData = {
            intValue: input.readVarint(0),
            floatValue: input.readFloat(),
            stringValue: input.readString(),
        }
        if (version === 37) {
            eventData.audioPath = input.readString()
            if (eventData.audioPath) {
                eventData.volume = input.readFloat()
                eventData.balance = input.readFloat()
            }
        }
        skeletonData.events[name] = eventData
    }

    /* Animations. */
    const animationsCount = input.readVarint(true)
    skeletonData.animations = {}
    for (let i = 0; i < animationsCount; ++i) {
        const name = input.readString()
        const animation = readAnimation(input, skeletonData, skins, version)
        if (!animation) {
            throw new Error('读取动画列表时出现错误')
        }
        skeletonData.animations[name] = animation
    }
    return skeletonData
}
