import { SpineSkeletonData } from './types';
/**
 * Spine v2.0/v2.1 二进制数据解析模块
 */
/**
 * 从二进制数据解析为 v2.0/v2.1 JSON 结构对象
 * @param binary - 二进制字节数据
 * @returns JSON 结构对象
 */
export declare function readSkeletonData21(binary: ArrayBuffer): SpineSkeletonData;
