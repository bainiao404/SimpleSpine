/**
 * Spine 资源版本映射配置与检测模块
 */

/**
 * Spine 版本映射配置
 * 用于定义原始版本、目标解析版本以及转换处理器
 * @type {Record<number, {target: string, handler: string|null}>}
 */
export const versionMap = {
    20: { target: '38', handler: 'readSkeletonData21' },
    21: { target: '38', handler: 'readSkeletonData21' },
    34: { target: '38', handler: 'readSkeletonData34And35' },
    35: { target: '38', handler: 'readSkeletonData34And35' },
    36: { target: '38', handler: 'readSkeletonData36And37' },
    37: { target: '38', handler: 'readSkeletonData36And37' },
    38: { target: '38', handler: null },
    40: { target: '40', handler: null },
    41: { target: '41', handler: null },
    42: { target: '42', handler: null },
}

/**
 * 将 Uint8Array 转换为字符串
 * @param {Uint8Array} u8Arr - 二进制字节数组
 * @param {string} [encoding='ascii'] - 编码格式，默认为 'ascii'
 * @returns {string}
 */
export function uint8ArrayToString(u8Arr, encoding = 'ascii') {
    return new TextDecoder(encoding).decode(u8Arr)
}

/**
 * 判断字符串或对象是否符合 Spine 版本特征，并返回标准化版本号 (如 "38")
 * @param {string|object} str - 待检测的字符串或 JSON 对象
 * @returns {string|null} 标准化版本号，未知时返回 null
 */
export function isVersion(str) {
    if (!str) {
        return null
    }

    // 如果是 JSON 对象，解析 skeleton 中的 version
    if (typeof str === 'object') {
        if (str.skeleton && str.skeleton.spine) {
            if (str.skeleton.spine.length <= 3) {
                return str.skeleton.spine.replace('.', '')
            }
            return str.skeleton.spine.slice(0, 3).replace('.', '')
        }
        return null
    }

    // 如果是二进制流转换而成的 ASCII 字符串，在固定偏移匹配版本字样
    if (typeof str === 'string') {
        const list = [
            [9, '4.0'],
            [8, '4.1'],
            [9, '4.2'],
            [29, '3.8'],
            [29, '3.7'],
            [29, '3.6'],
            [29, '3.5'],
            [29, '3.4'],
            [29, '2.1'],
        ]
        for (let i = 0; i < list.length; i++) {
            const [offset, prefix] = list[i]
            const segment = str.slice(offset, offset + 6)
            const matches = segment.match(/\d\.\d\.\d\d/g)
            if (matches && matches[0].startsWith(prefix)) {
                return matches[0].slice(0, 3).replace('.', '')
            }
        }
    }
    return null
}

/**
 * 从二进制或 JSON 数据中自动识别 Spine 编辑器版本
 * @param {object} params
 * @param {ArrayBuffer|string} params.data - 文件原始数据
 * @param {string} params.type - 文件类型 ('skel' | 'json')
 * @param {string} [params.fallbackVersion] - 识别失败时的回退版本
 * @returns {string|null} 版本号字符串 (如 "38")
 */
export function detectSpineVersion({ data, type, fallbackVersion }) {
    let versionStr = ''
    if (type === 'skel') {
        versionStr = uint8ArrayToString(new Uint8Array(data).slice(0, 40))
    } else {
        try {
            versionStr = typeof data === 'string' ? JSON.parse(data) : data
        } catch {}
    }
    return isVersion(versionStr) || fallbackVersion
}
