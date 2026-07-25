import { SpineSkeletonData } from './types';
/**
 * Spine v3.6/v3.7 二进制数据解析模块
 */
/**
 * 从二进制数据解析为 v3.6/v3.7 JSON 结构对象
 * @param binary - 二进制字节数据
 * @returns JSON 结构对象
 */
export declare function readSkeletonData36And37(binary: ArrayBuffer): SpineSkeletonData;
