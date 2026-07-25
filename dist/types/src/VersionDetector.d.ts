import { VersionConfig } from './types';
/**
 * Spine 资源版本映射配置与检测模块
 */
/**
 * Spine 版本映射配置
 * 用于定义原始版本、目标解析版本以及转换处理器
 */
export declare const versionMap: Record<number, VersionConfig>;
/**
 * 将 Uint8Array 转换为字符串
 * @param u8Arr - 二进制字节数组
 * @param encoding - 编码格式，默认为 'ascii'
 */
export declare function uint8ArrayToString(u8Arr: Uint8Array, encoding?: string): string;
/**
 * 判断字符串或对象是否符合 Spine 版本特征，并返回标准化版本号 (如 "38")
 * @param str - 待检测的字符串或 JSON 对象
 */
export declare function isVersion(str: any): string | null;
/**
 * 从二进制或 JSON 数据中自动识别 Spine 编辑器版本
 */
export declare function detectSpineVersion({ data, type, fallbackVersion, }: {
    data: ArrayBuffer | string;
    type: 'skel' | 'json';
    fallbackVersion?: string;
}): string | null;
