/**
 * 纹理与图像数据处理辅助模块
 */

// 预计算查找表：将除法转为乘法，优化性能
export const INV_ALPHA_TABLE = (() => {
    const table = new Float32Array(256)
    for (let i = 1; i < 256; i++) {
        table[i] = 255 / i
    }
    table[0] = 0
    return table
})()

/**
 * 判断 RGBA 数组是否为预乘 Alpha 格式
 * @param {Uint8Array|Uint8ClampedArray} imageData - RGBA 像素数据字节数组
 * @param {number} [tolerance=10] - 容差范围值
 * @returns {boolean}
 */
export function isPremultipliedAlpha(imageData, tolerance = 10) {
    if (!imageData) return false
    for (let i = 0; i < imageData.length; i += 4) {
        const red = imageData[i]
        const green = imageData[i + 1]
        const blue = imageData[i + 2]
        const alpha = imageData[i + 3] + tolerance

        if (red > alpha || green > alpha || blue > alpha) {
            return false // 如果任何一个像素的 RGB 值大于其 Alpha（带容差），则不是预乘
        }
    }
    return true
}

/**
 * 探测 PIXI BaseTexture 是否为预乘纹理
 * @param {any} baseTexture - PIXI.BaseTexture 实例或相关包装对象
 * @returns {boolean}
 */
export function isPremultiplied(baseTexture) {
    if (!baseTexture) return false

    let targetTexture = Array.isArray(baseTexture) ? baseTexture[0] : baseTexture
    if (targetTexture.texture) {
        targetTexture = targetTexture.texture
    }

    const resource = targetTexture.resource
    if (!resource) return false

    if (resource.source) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { premultiplyAlpha: 'none' })
        canvas.width = targetTexture.width
        canvas.height = targetTexture.height
        ctx.drawImage(resource.source, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        return isPremultipliedAlpha(imageData.data, 20)
    } else if (resource.data) {
        return isPremultipliedAlpha(resource.data, 20)
    }
    return false
}

/**
 * 图像重采样：将 RGBA 缓冲数据调整为目标尺寸（双线性插值或临近插值采样）
 * @param {Uint8Array} buffer - 原始 RGBA 数据缓冲
 * @param {number} oldW - 原始宽度
 * @param {number} oldH - 原始高度
 * @param {number} newW - 目标宽度
 * @param {number} newH - 目标高度
 * @returns {Uint8Array}
 */
export function resizeRgbaBuffer(buffer, oldW, oldH, newW, newH) {
    const newBuffer = new Uint8Array(newW * newH * 4)
    for (let y = 0; y < newH; y++) {
        for (let x = 0; x < newW; x++) {
            const srcX = Math.floor(x * (oldW / newW))
            const srcY = Math.floor(y * (oldH / newH))
            const srcIdx = (srcY * oldW + srcX) * 4
            const dstIdx = (y * newW + x) * 4
            // 复制 RGBA 通道
            newBuffer.set(buffer.subarray(srcIdx, srcIdx + 4), dstIdx)
        }
    }
    return newBuffer
}

/**
 * 将预乘 Alpha (Premultiplied Alpha) 还原为直色 Alpha (Straight Alpha)
 * @param {Uint8Array|Uint8ClampedArray} rgbaArray - 原始 RGBA 缓冲数组
 * @returns {Uint8Array}
 */
export function premultipliedToStraight(rgbaArray) {
    const len = rgbaArray.length
    const result = new Uint8ClampedArray(len)
    result.set(rgbaArray)

    for (let i = 0; i < len; i += 4) {
        const a = rgbaArray[i + 3]
        // 只有当 Alpha 处于透明与不透明之间 (0, 255) 时才需计算
        if (a > 0 && a < 255) {
            const invAlpha = INV_ALPHA_TABLE[a]
            result[i] = rgbaArray[i] * invAlpha
            result[i + 1] = rgbaArray[i + 1] * invAlpha
            result[i + 2] = rgbaArray[i + 2] * invAlpha
        }
    }

    return new Uint8Array(result.buffer)
}
