import { VersionConfig } from './types';

/**
 * Spine 资源版本映射配置与检测模块
 */

/**
 * Spine 版本映射配置
 * 用于定义原始版本、目标解析版本以及转换处理器
 */
export const versionMap: Record<number, VersionConfig> = {
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
    43: { target: '42', handler: null },
};

/**
 * 将 Uint8Array 转换为字符串
 * @param u8Arr - 二进制字节数组
 * @param encoding - 编码格式，默认为 'ascii'
 */
export function uint8ArrayToString(u8Arr: Uint8Array, encoding: string = 'ascii'): string {
    return new TextDecoder(encoding).decode(u8Arr);
}

/**
 * 判断字符串或对象是否符合 Spine 版本特征，并返回标准化版本号 (如 "38")
 * @param str - 待检测的字符串或 JSON 对象
 */
export function isVersion(str: any): string | null {
    if (!str) {
        return null;
    }

    // 如果是 JSON 对象，解析 skeleton 中的 version
    if (typeof str === 'object') {
        if (str.skeleton && str.skeleton.spine) {
            const version: string = str.skeleton.spine;
            if (version.length <= 3) {
                return version.replace('.', '');
            }
            return version.slice(0, 3).replace('.', '');
        }
        return null;
    }

    // 如果是二进制流转换而成的 ASCII 字符串，在固定偏移匹配版本字样
    if (typeof str === 'string') {
        const list: [number, string][] = [
            [9, '4.0'],
            [9, '4.1'],
            [9, '4.2'],
            [9, '4.3'],
            [29, '3.8'],
            [29, '3.7'],
            [29, '3.6'],
            [29, '3.5'],
            [29, '3.4'],
            [29, '2.1'],
        ];
        for (let i = 0; i < list.length; i++) {
            const [offset, prefix] = list[i];
            const segment = str.slice(offset, offset + 6);
            const matches = segment.match(/\d\.\d\.\d\d/g);
            if (matches && matches[0].startsWith(prefix)) {
                return matches[0].slice(0, 3).replace('.', '');
            }
        }
    }
    return null;
}

/**
 * 从二进制或 JSON 数据中自动识别 Spine 编辑器版本
 */
export function detectSpineVersion({
    data,
    type,
    fallbackVersion,
}: {
    data: ArrayBuffer | string;
    type: 'skel' | 'json';
    fallbackVersion?: string;
}): string | null {
    let versionStr: any = '';
    if (type === 'skel') {
        versionStr = uint8ArrayToString(new Uint8Array(data as ArrayBuffer).slice(0, 40));
    } else {
        try {
            versionStr = typeof data === 'string' ? JSON.parse(data) : data;
        } catch {}
    }
    return isVersion(versionStr) || fallbackVersion || null;
}
