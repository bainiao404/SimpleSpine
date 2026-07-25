/**
 * SimpleSpine v0.2 主入口模块
 * 采用 ES6 模块化设计，提供 Spine 动画的加载、解析与实例化功能
 */
import * as pixiSpine from '../bundles/pixi-spine/src/index.ts'

if (typeof window !== 'undefined') {
    window.PIXI = window.PIXI || {}
    window.PIXI.spine = window.PIXI.spine || {}
    Object.assign(window.PIXI.spine, pixiSpine)
}

import { spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 } from './SkelToJson.js'
import { detectSpineVersion, isVersion, versionMap } from './VersionDetector.js'

export { spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 }
export { detectSpineVersion, isVersion, versionMap }

import { isPremultiplied, isPremultipliedAlpha, resizeRgbaBuffer, premultipliedToStraight } from './TextureHelper.js'

const handlers = {
    readSkeletonData21,
    readSkeletonData34And35,
    readSkeletonData36And37,
}

/**
 * 获取文件目录路径
 * @param {string} src - 文件路径
 * @returns {string} 目录路径，以 '/' 结尾
 */
export function getFileDirectory(src) {
    if (typeof src !== 'string' || !src) return ''
    const normalizedPath = src.replace(/\\/g, '/')
    const lastSlashIndex = normalizedPath.lastIndexOf('/')
    if (lastSlashIndex === -1) return ''
    return normalizedPath.substring(0, lastSlashIndex + 1)
}

/**
 * 解析 Atlas 文本以获取纹理信息列表
 * @param {string} atlasData - Atlas 文本内容
 * @returns {Array<{name: string, width: number, height: number}>}
 */
export function getTextureAtlasInfo(atlasData) {
    const lines = atlasData.split(/\r?\n/)
    const list = []
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const lowerLine = line.toLowerCase()
        if (
            lowerLine.endsWith('.png') ||
            lowerLine.endsWith('.jpg') ||
            lowerLine.endsWith('.jpeg') ||
            lowerLine.endsWith('.webp') ||
            lowerLine.includes('blob:')
        ) {
            const sizeLine = lines[i + 1] || ''
            const sizeMatch = sizeLine.match(/size\s*:\s*(\d+)\s*,\s*(\d+)/)
            list.push({
                name: line,
                width: sizeMatch ? parseInt(sizeMatch[1]) : 0,
                height: sizeMatch ? parseInt(sizeMatch[2]) : 0,
            })
        }
    }
    return list
}

/**
 * 提取骨骼、图集和纹理的完整访问路径
 * @param {string|object} src - 资源来源路径或配置对象
 * @param {object} [options={}] - 配置项
 * @returns {object}
 */
export function getSpineSrc(src, options = {}) {
    if (!src) throw new Error('地址不存在')

    if (typeof src === 'string') {
        const isSkel = src.endsWith('.skel')
        if (!isSkel && !src.endsWith('.json')) throw new Error(`格式不支持: ${src}`)

        return {
            type: isSkel ? 'skel' : 'json',
            path: [
                src,
                options.atlasPath || src.replace(/\.(skel|json)$/, '.atlas'),
                options.texturePath || getFileDirectory(src),
            ],
            atlasPath: options.atlasPath,
            texturePath: options.texturePath,
        }
    }
    return {
        ...src,
        atlasPath: options.atlasPath || src.atlasPath || src.path[1],
        texturePath: options.texturePath || src.texturePath || src.path[2] || getFileDirectory(src.path[0]),
    }
}

/**
 * 构造纹理加载信息列表
 * @param {string} atlasData - Atlas 文本
 * @param {string} textureBasePath - 纹理基础目录路径
 * @returns {Array<{name: string, src: string}>}
 */
export function prepareTextureData(atlasData, textureBasePath) {
    return getTextureAtlasInfo(atlasData).map((item) => {
        let srcUrl = item.name
        if (
            !item.name.startsWith('blob:') &&
            !item.name.startsWith('http:') &&
            !item.name.startsWith('https:') &&
            !item.name.startsWith('data:')
        ) {
            srcUrl = textureBasePath + item.name
        }
        return {
        name: item.name,
            src: srcUrl,
        }
    })
}

/**
 * 内部辅助：Promise 化的 BaseTexture 加载器
 * @private
 * @param {string} url - 纹理图片 URL 地址
 * @returns {Promise<any>} PIXI.BaseTexture 实例
 */
function _loadBaseTexture(url) {
    return new Promise((resolve, reject) => {
        if (typeof PIXI === 'undefined') {
            return reject(new Error('全局 PIXI 对象不存在，请确保已加载 PixiJS'))
        }
        const bt = PIXI.BaseTexture.from(url)
        if (bt.valid) return resolve(bt)
        bt.once('loaded', () => resolve(bt))
        bt.once('error', () => reject(new Error(`纹理加载失败: ${url}`)))
    })
}

/**
 * 基于原生 XMLHttpRequest (AJAX) 请求文件
 * @param {string} url - 目标 URL
 * @param {string} [responseType='text'] - 响应数据类型 (text, arraybuffer)
 * @param {object} [options={}] - 配置参数，如 onProgress
 * @returns {Promise<{data: any, status: number}>}
 */
export function loadFile(url, responseType = 'text', options = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = responseType

        xhr.onload = () => {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                resolve({ data: xhr.response, status: xhr.status })
            } else {
                reject(new Error(`HTTP ${xhr.status} : ${url}`))
            }
        }

        if (options.onProgress) {
            xhr.onprogress = (e) => {
                if (e.lengthComputable) {
                    options.onProgress(Math.round((e.loaded / e.total) * 100))
                }
            }
        }

        xhr.onerror = () => reject(new Error('网络请求错误'))
        xhr.send()
    })
}

/**
 * 核心解析方法：绑定纹理并调用对应版本的 Spine SDK 进行解析
 * @param {object} config
 * @returns {Promise<object>} Spine 解析结果对象
 */
export async function readSpineSpineData(config) {
    const { version, type, skeletonData, atlasData, textureData, originalSpine } = config

    if (typeof PIXI === 'undefined' || !PIXI.spine) {
        throw new Error('未加载 PIXI.spine 插件')
    }

    const spineSdk = PIXI.spine[`spine${version}`] || PIXI.spine

    // 建立纹理索引 Map，优化查询效率
    const atlasInfoList = getTextureAtlasInfo(atlasData)
    const atlasInfoMap = new Map(atlasInfoList.map((item) => [item.name, item]))

    // 1. 准备所有 BaseTexture
    await Promise.all(
        textureData.map(async (tex) => {
            if (!tex.name.includes('.')) tex.name += '.png'
            const info = atlasInfoMap.get(tex.name)
            if (!info) return

            // 加载 BaseTexture
            if (tex.src) {
                tex.texture = await _loadBaseTexture(tex.src)
            } else if (tex.data) {
                let buffer = tex.data
                if (tex.width !== info.width || tex.height !== info.height) {
                    if (isPremultipliedAlpha(buffer)) {
                        tex.texture.isPremultipliedToStraight = true
                        buffer = premultipliedToStraight(buffer)
                    }
                    buffer = resizeRgbaBuffer(buffer, tex.width, tex.height, info.width, info.height)
                }
                tex.texture = PIXI.BaseTexture.fromBuffer(buffer, info.width, info.height)
            }

            // 强行校正尺寸以匹配 atlas 定义
            if (tex.texture && (tex.texture.width !== info.width || tex.texture.height !== info.height)) {
                tex.texture.setSize(info.width, info.height)
            }
        }),
    )

    // 2. 创建 TextureAtlas
    let spineAtlas
    if (parseInt(version, 10) < 42) {
        spineAtlas = new PIXI.spine.TextureAtlas(atlasData, (line, callback) => {
            const found = textureData.find((t) => t.name === line)
            callback(found ? found.texture : null)
        })
    } else {
        spineAtlas = new spineSdk.TextureAtlas(atlasData)
        for (const page of spineAtlas.pages) {
            const found = textureData.find((t) => t.name === page.name)
            if (found) {
                page.setTexture(spineSdk.SpineTexture.from(found.texture))
            }
        }
    }

    // 3. 解析骨架数据
    const attachmentLoader = new spineSdk.AtlasAttachmentLoader(spineAtlas)
    let parser
    let finalData = skeletonData

    if (type === 'skel') {
        parser = new spineSdk.SkeletonBinary(attachmentLoader)
        finalData = new Uint8Array(skeletonData)
    } else {
        parser = new spineSdk.SkeletonJson(attachmentLoader)
        if (typeof skeletonData === 'string') {
            finalData = JSON.parse(skeletonData)
        }
    }

    const spineResult = {
        spine: parser.readSkeletonData ? parser.readSkeletonData(finalData) : parser.SkeletonData(finalData),
        atlas: attachmentLoader,
        texture: textureData.map((t) => t.texture).filter(Boolean),
        originalSpine,
        version,
        setPremultiplied: function (isP) {
            const needsP = isP || isPremultiplied(this.texture[0])
            this.texture.forEach((t) => {
                if (t.isPremultipliedToStraight) return
                t.isPremultipliedToStraight = true
                t.alphaMode = needsP ? PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA : PIXI.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
            })
        },
    }

    return spineResult
}

/**
 * 数据预处理：执行版本检测、格式转换（skel -> json）以及跨版本兼容处理
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function processSpineData(params) {
    const { version, skelData, atlasData, textureData } = params
    const config = versionMap[version]
    if (!config) throw new Error(`不受支持的spine版本: ${version}`)

    let skeletonData = skelData
    let originalSpine = null

    const checkType = (val) => {
        if (val instanceof ArrayBuffer) return 'skel'
        if (typeof val === 'string') return 'json'
        return 'obj'
    }

    if (config.handler) {
        let currentType = checkType(skeletonData)
        if (currentType === 'skel') {
            const handlerFn = handlers[config.handler]
            if (handlerFn) {
                skeletonData = handlerFn(skelData)
            }
        }

        currentType = checkType(skeletonData)
        if (currentType === 'json') {
            skeletonData = JSON.parse(skeletonData)
        }

        if (checkType(skeletonData) === 'obj') {
            originalSpine = skeletonData
            skeletonData = spine36To38(skeletonData)
        }
    }

    return readSpineSpineData({
        version: config.target,
        type: checkType(skeletonData),
        skeletonData,
        atlasData,
        textureData: Array.isArray(textureData) ? textureData : [textureData],
        originalSpine,
    })
}

/**
 * 外部加载入口函数
 * @param {string|object} src - 路径字符串或结构化的路径对象
 * @param {object} [options={}] - 配置项
 * @returns {Promise<object>}
 */
export async function load(src, options = {}) {
    const srcs = getSpineSrc(src, options)
    const skelFileType = srcs.type === 'skel' ? 'arraybuffer' : 'text'

    try {
        const [skelRes, atlasRes] = await Promise.all([
            loadFile(srcs.path[0], skelFileType, { onProgress: options.onProgress }),
            loadFile(srcs.atlasPath || srcs.path[1], 'text'),
        ])

        const textureData = prepareTextureData(atlasRes.data, srcs.texturePath || srcs.path[2])

        const version = detectSpineVersion({
            data: skelRes.data,
            type: srcs.type,
            fallbackVersion: srcs.version,
        })

        if (!version) throw new Error('未知版本号或者非spine文件')

        const processedData = await processSpineData({
            version,
            skelData: skelRes.data,
            atlasData: atlasRes.data,
            textureData,
            fileType: srcs.type,
        })

        return { ...processedData, info: srcs }
    } catch (error) {
        console.error('加载Spine资源失败:', error)
        throw error
    }
}

/**
 * 实例化 Spine 对象并附加调试渲染器
 * @param {object} spineData - 由 load 方法返回的已处理数据对象
 * @returns {object} 包含 { spine, debug, setDebug }
 */
export function spine(spineData) {
    if (typeof PIXI === 'undefined' || !PIXI.spine) {
        throw new Error('未加载 PIXI.spine 插件')
    }

    const isV42 = spineData.version === '42' || spineData.version === 42
    const sdk = isV42 ? PIXI.spine.spine42 : PIXI.spine

    const spineInstance = isV42 ? new sdk.Spine({ skeletonData: spineData.spine }) : new sdk.Spine(spineData.spine)

    const debugRenderer = new sdk.SpineDebugRenderer()

    return {
        spine: spineInstance,
        debug: debugRenderer,
        setDebug: function () {
            this.spine.debug = this.debug
        },
    }
}

let SimpleSpine = {
    load,
    spine,
    loadFile,
    detectSpineVersion,
    isVersion,
    versionMap,
}

if (typeof window !== 'undefined') {
    window.SimpleSpine = window.SimpleSpine || SimpleSpine
}

// 默认导出对象，方便在不支持命名导入的场景下使用
export default SimpleSpine
