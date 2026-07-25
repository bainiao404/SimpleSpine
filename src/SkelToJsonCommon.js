/**
 * Spine 各个版本解析器共用的公共底层读取与解析函数
 */

/**
 * 读取顶点权重与坐标数据
 * @param {import('./BinaryInput.js').BinaryInput} input
 * @param {object} attachment
 * @param {number} vertexCount
 */
export function readVertices(input, attachment, vertexCount) {
    const verticesLength = vertexCount * 2
    const weights = []
    if (!input.readBoolean()) {
        attachment.verticesCount = verticesLength
        attachment.vertices = input.readFloatArray(verticesLength)
        attachment.bonesCount = 0
        return
    }

    for (let i = 0; i < vertexCount; ++i) {
        const boneCount = input.readVarint(true)
        weights.push(boneCount)
        for (let ii = 0; ii < boneCount; ++ii) {
            weights.push(input.readVarint(true)) // 骨骼索引
            weights.push(input.readFloat()) // 权重 x
            weights.push(input.readFloat()) // 权重 y
            weights.push(input.readFloat()) // 权重 z
        }
    }
    attachment.vertices = weights
}

/**
 * 解析单个 Attachment 数据 (v3.4 - v3.7)
 * @param {import('./BinaryInput.js').BinaryInput} input
 * @param {string} attachmentName
 * @param {object} skeletonData
 * @param {boolean} nonessential
 * @returns {object}
 */
export function readAttachment(input, attachmentName, skeletonData, nonessential) {
    let name = input.readString()
    if (!name) {
        name = attachmentName
    }

    const type = input.readByte()
    const typeMode = ['region', 'boundingbox', 'mesh', 'linkedmesh', 'path', 'point', 'clipping']
    const attachment = {}

    switch (type) {
        case 0: {
            // SP_ATTACHMENT_REGION
            let path = input.readString()
            if (!path) {
                path = name
            }
            attachment.path = path
            attachment.rotation = input.readFloat()
            attachment.x = input.readFloat()
            attachment.y = input.readFloat()
            attachment.scaleX = input.readFloat()
            attachment.scaleY = input.readFloat()
            attachment.width = input.readFloat()
            attachment.height = input.readFloat()
            attachment.color = input.readColorHex()
            break
        }
        case 1: {
            // SP_ATTACHMENT_BOUNDING_BOX
            const vertexCount = input.readVarint(true)
            attachment.vertexCount = vertexCount
            readVertices(input, attachment, vertexCount)
            if (nonessential) {
                attachment.color = input.readColorHex()
            }
            break
        }
        case 2: {
            // SP_ATTACHMENT_MESH
            let path = input.readString()
            if (!path) {
                path = name
            }
            attachment.path = path
            attachment.color = input.readColorHex()
            attachment.vertexCount = input.readVarint(true)
            attachment.uvs = input.readFloatArray(attachment.vertexCount * 2)
            attachment.triangles = input.readShortArray()
            readVertices(input, attachment, attachment.vertexCount)
            attachment.hull = input.readVarint(true)

            if (nonessential) {
                attachment.edges = input.readShortArray()
                attachment.width = input.readFloat()
                attachment.height = input.readFloat()
            }
            break
        }
        case 3: {
            // SP_ATTACHMENT_LINKED_MESH
            let path = input.readString()
            if (!path) {
                path = name
            }
            attachment.path = path
            attachment.color = input.readColorHex()
            attachment.skin = input.readString()
            attachment.parent = input.readString()
            attachment.inheritDeform = input.readBoolean()

            if (nonessential) {
                attachment.width = input.readFloat()
                attachment.height = input.readFloat()
            }
            break
        }
        case 4: {
            // SP_ATTACHMENT_PATH
            attachment.closed = input.readBoolean()
            attachment.constantSpeed = input.readBoolean()
            const vertexCount = input.readVarint(true)
            attachment.vertexCount = vertexCount
            readVertices(input, attachment, vertexCount)
            const lengthsLength = vertexCount / 3
            attachment.lengths = new Array(lengthsLength)
            for (let i = 0; i < lengthsLength; ++i) {
                attachment.lengths[i] = input.readFloat()
            }
            if (nonessential) {
                attachment.color = input.readColorHex()
            }
            break
        }
        case 5: {
            // SP_ATTACHMENT_POINT
            attachment.rotation = input.readFloat()
            attachment.x = input.readFloat()
            attachment.y = input.readFloat()
            if (nonessential) {
                attachment.color = input.readColorHex()
            }
            break
        }
        case 6: {
            // SP_ATTACHMENT_CLIPPING
            const endSlotIndex = input.readVarint(true)
            const vertexCount = input.readVarint(true)
            attachment.vertexCount = vertexCount
            readVertices(input, attachment, vertexCount)

            if (nonessential) {
                attachment.color = input.readColorHex()
            }
            attachment.end = skeletonData.slots[endSlotIndex].name
            break
        }
    }
    attachment.type = typeMode[type]
    if (!attachment.name) {
        attachment.name = attachmentName
    }
    return attachment
}

/**
 * 解析单个 Skin 数据 (v3.4 - v3.7)
 * @param {import('./BinaryInput.js').BinaryInput} input
 * @param {object} skeletonData
 * @param {boolean} nonessential
 * @returns {object}
 */
export function readSkin(input, skeletonData, nonessential) {
    const slotCount = input.readVarint(true)
    if (slotCount === 0) {
        return null
    }
    const skin = {}
    for (let i = 0; i < slotCount; ++i) {
        const slotIndex = input.readVarint(true)
        const nn = input.readVarint(true)
        const slot = {}
        for (let ii = 0; ii < nn; ++ii) {
            const name = input.readString()
            const attachment = readAttachment(input, name, skeletonData, nonessential)
            if (attachment) {
                slot[name] = attachment
            }
            skin[skeletonData.slots[slotIndex].name] = slot
        }
    }
    return skin
}

/**
 * 解析动画数据 (v3.4 - v3.7)
 * @param {import('./BinaryInput.js').BinaryInput} input
 * @param {object} skeletonData
 * @param {Array} skins
 * @param {number} [version=36]
 * @returns {object}
 */
export function readAnimation(input, skeletonData, skins, version = 36) {
    const animationData = {}
    let duration = 0

    // 1. Slot timelines.
    const slotData = {}
    const slotCount = input.readVarint(true)
    for (let i = 0; i < slotCount; ++i) {
        const slotIndex = input.readVarint(true)
        const slotMap = {}
        const timelineCount = input.readVarint(true)
        for (let ii = 0; ii < timelineCount; ++ii) {
            const timelineType = input.readByte()
            const frameCount = input.readVarint(true)
            switch (timelineType) {
                case 0: {
                    // SLOT_ATTACHMENT
                    const timeline = []
                    for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
                        const data = {
                            time: input.readFloat(),
                            name: input.readString(),
                        }
                        timeline.push(data)
                    }
                    slotMap.attachment = timeline
                    duration = Math.max(duration, timeline[frameCount - 1].time)
                    break
                }
                case 1: {
                    // SLOT_COLOR
                    const timeline = []
                    for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
                        const data = {
                            time: input.readFloat(),
                            color: input.readColorHex(),
                        }
                        if (frameIndex < frameCount - 1) {
                            const curve = input.readCurve()
                            if (curve !== undefined) {
                                data.curve = curve
                            }
                        }
                        timeline.push(data)
                    }
                    slotMap.color = timeline
                    duration = Math.max(duration, timeline[frameCount - 1].time)
                    break
                }
                case 2: {
                    // SLOT_TWO_COLOR
                    const timeline = []
                    for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
                        const data = {
                            time: input.readFloat(),
                            light: input.readColorHex(),
                            dark: input.readColorHex(),
                        }
                        if (frameIndex < frameCount - 1) {
                            const curve = input.readCurve()
                            if (curve !== undefined) {
                                data.curve = curve
                            }
                        }
                        timeline.push(data)
                    }
                    slotMap.twoColor = timeline
                    duration = Math.max(duration, timeline[frameCount - 1].time)
                    break
                }
                default:
                    return null
            }
        }
        slotData[skeletonData.slots[slotIndex].name] = slotMap
    }
    animationData.slots = slotData

    // 2. Bone timelines
    const boneData = {}
    const boneCount = input.readVarint(true)
    for (let i = 0; i < boneCount; i++) {
        const boneIndex = input.readVarint(true)
        const boneMap = {}
        const timelineCount = input.readVarint(true)

        for (let ii = 0; ii < timelineCount; ii++) {
            const timelineType = input.readByte()
            const frameCount = input.readVarint(true)

            const processFrame = (frameHandler) => {
                const timeline = []
                for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    const data = frameHandler()
                    if (frameIndex < frameCount - 1) {
                        const curve = input.readCurve()
                        if (curve) data.curve = curve
                    }
                    timeline.push(data)
                }
                return timeline
            }

            switch (timelineType) {
                case 0: {
                    // BONE_ROTATE
                    const timeline = processFrame(() => ({
                        time: input.readFloat(),
                        angle: input.readFloat(),
                    }))
                    boneMap.rotate = timeline
                    duration = Math.max(duration, timeline[frameCount - 1].time)
                    break
                }
                case 1:
                case 2:
                case 3: {
                    // BONE_TRANSLATE, SCALE, SHEAR
                    const typeNames = ['', 'translate', 'scale', 'shear']
                    const timeline = processFrame(() => ({
                        time: input.readFloat(),
                        x: input.readFloat(),
                        y: input.readFloat(),
                    }))
                    boneMap[typeNames[timelineType]] = timeline
                    break
                }
                default:
                    return null
            }
        }
        boneData[skeletonData.bones[boneIndex].name] = boneMap
    }
    animationData.bones = boneData

    // 3. IK constraint timelines
    const ikData = {}
    const ikCount = input.readVarint(true)
    for (let i = 0; i < ikCount; ++i) {
        const index = input.readVarint(true)
        const frameCount = input.readVarint(true)
        const timeline = []
        for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
            const data = {
                time: input.readFloat(),
                mix: input.readFloat(),
                bendPositive: input.readByte() !== 255,
            }
            if (version === 37) {
                data.compress = input.readBoolean()
                data.stretch = input.readBoolean()
            }
            if (frameIndex < frameCount - 1) {
                const curve = input.readCurve()
                if (curve) {
                    data.curve = curve
                }
            }
            timeline.push(data)
        }
        ikData[skeletonData.ik[index].name] = timeline
    }
    animationData.ik = ikData

    // 4. Transform constraint timelines.
    const transformData = {}
    const transformCount = input.readVarint(true)
    for (let i = 0; i < transformCount; ++i) {
        const index = input.readVarint(true)
        const frameCount = input.readVarint(true)
        const timeline = []
        for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
            const data = {
                time: input.readFloat(),
                rotateMix: input.readFloat(),
                translateMix: input.readFloat(),
                scaleMix: input.readFloat(),
                shearMix: input.readFloat(),
            }
            if (frameIndex < frameCount - 1) {
                const curve = input.readCurve()
                if (curve !== undefined) {
                    data.curve = curve
                }
            }
            timeline.push(data)
        }
        transformData[skeletonData.transform[index].name] = timeline
    }
    animationData.transform = transformData

    // 5. Path constraint timelines
    const pathData = {}
    const pathCount = input.readVarint(true)
    for (let i = 0; i < pathCount; i++) {
        const pathIndex = input.readVarint(true)
        const timelineCount = input.readVarint(true)
        const pathName = skeletonData.path[pathIndex].name
        pathData[pathName] = {}

        for (let ii = 0; ii < timelineCount; ii++) {
            const timelineType = input.readByte()
            const frameCount = input.readVarint(true)
            const timelineTypeNames = ['position', 'spacing', 'mix']
            const timelineTypeName = timelineTypeNames[timelineType]

            const processFrame = (frameHandler) => {
                const timeline = []
                for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    const data = frameHandler()
                    if (frameIndex < frameCount - 1) {
                        const curve = input.readCurve()
                        if (curve) data.curve = curve
                    }
                    timeline.push(data)
                }
                return timeline
            }

            let timeline
            switch (timelineType) {
                case 0:
                case 1: // PATH_POSITION, PATH_SPACING
                    timeline = processFrame(() => ({
                        time: input.readFloat(),
                        position: input.readFloat(),
                    }))
                    break
                case 2: // PATH_MIX
                    timeline = processFrame(() => ({
                        time: input.readFloat(),
                        rotateMix: input.readFloat(),
                        translateMix: input.readFloat(),
                    }))
                    break
                default:
                    return null
            }
            pathData[pathName][timelineTypeName] = timeline
            duration = Math.max(duration, timeline[frameCount - 1].time)
        }
    }
    animationData.paths = pathData

    // 6. Deform timelines
    const deformData = {}
    const processDeformFrames = (frameCount) => {
        const timeline = []
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const data = { time: input.readFloat() }
            const vertexCount = input.readVarint(true)

            if (vertexCount > 0) {
                const startOffset = input.readVarint(true)
                const vertices = Array.from({ length: vertexCount }, () => input.readFloat())
                data.vertices = vertices
                data.offset = startOffset
            }
            if (frameIndex < frameCount - 1) {
                const curve = input.readCurve()
                if (curve !== undefined) {
                    data.curve = curve
                }
            }
            timeline.push(data)
        }
        return timeline
    }

    const getAttachmentFromSkins = (attachments, meshName) => {
        for (const attachmentName in attachments) {
            if (attachments[attachmentName].name === meshName) {
                return attachments[attachmentName]
            }
        }
        return null
    }

    const skinCount = input.readVarint(true)
    for (let i = 0; i < skinCount; i++) {
        const skinIndex = input.readVarint(true)
        const skin = skins[skinIndex].data
        const skinMap = {}

        const slotCount = input.readVarint(true)
        for (let ii = 0; ii < slotCount; ii++) {
            const slotIndex = input.readVarint(true)
            const slotName = skeletonData.slots[slotIndex].name
            const slot = {}

            const attachmentCount = input.readVarint(true)
            for (let iii = 0; iii < attachmentCount; iii++) {
                const attachmentName = input.readString()
                let attachments = skin[slotName]
                let attachment = getAttachmentFromSkins(attachments, attachmentName)
                if (!attachment && skinIndex !== 0) {
                    const defaultSkin = skins[0].data
                    attachments = defaultSkin[slotName]
                    attachment = getAttachmentFromSkins(attachments, attachmentName)
                }
                if (!attachment) throw new Error('匹配deform中的attachment失败')

                const frameCount = input.readVarint(true)
                const timeline = processDeformFrames(frameCount)

                slot[attachmentName] = timeline
                duration = Math.max(duration, timeline[frameCount - 1].time)
            }
            skinMap[slotName] = slot
        }
        deformData[skins[skinIndex].name] = skinMap
    }
    animationData.deform = deformData

    // 7. Draw order timeline.
    const drawOrderCount = input.readVarint(true)
    if (drawOrderCount) {
        const drawOrders = []
        for (let i = 0; i < drawOrderCount; ++i) {
            const drawOrderMap = {}
            const time = input.readFloat()
            const offsetCount = input.readVarint(true)
            const offsets = []
            for (let ii = 0; ii < offsetCount; ++ii) {
                const slotIndex = input.readVarint(true)
                const data = {
                    slot: skeletonData.slots[slotIndex].name,
                    offset: input.readVarint(true),
                }
                offsets.push(data)
            }
            drawOrderMap.offsets = offsets
            drawOrderMap.time = time
            drawOrders.push(drawOrderMap)
        }
        duration = Math.max(duration, drawOrders[drawOrderCount - 1].time)
        animationData.drawOrder = drawOrders
    }

    // 8. Event timeline.
    const eventCount = input.readVarint(true)
    if (eventCount) {
        const timeline = []
        const eventKeys = Object.keys(skeletonData.events)
        for (let i = 0; i < eventCount; ++i) {
            const time = input.readFloat()
            const name = eventKeys[input.readVarint(true)]
            const eventData = skeletonData.events[name]
            const event = {
                int: input.readVarint(0),
                float: input.readFloat(),
                string: input.readBoolean() ? input.readString() : (eventData ? eventData.stringValue : ''),
                time: time,
                name: name,
            }
            timeline.push(event)
        }
        animationData.events = timeline
        duration = Math.max(duration, timeline[eventCount - 1].time)
    }

    // 清理空对象键
    Object.keys(animationData).forEach((key) => {
        if (Object.keys(animationData[key]).length === 0) {
            delete animationData[key]
        }
    })

    return animationData
}
