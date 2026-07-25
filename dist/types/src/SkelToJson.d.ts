import { readSkeletonData21 } from './SkelToJson21';
import { readSkeletonData34And35 } from './SkelToJson34And35';
import { readSkeletonData36And37 } from './SkelToJson36And37';
import { SpineSkeletonData } from './types';
export { readSkeletonData21, readSkeletonData34And35, readSkeletonData36And37 };
/**
 * 将骨架数据从遗留版本格式规范化升级为 v3.8 标准 JSON 结构
 * @param obj - 原始遗留版本 JSON 结构对象
 * @returns 转换后的 3.8 标准对象
 */
export declare function normalizeTo38(obj: SpineSkeletonData): SpineSkeletonData;
/**
 * @deprecated 请使用 normalizeTo38 代替
 */
export declare function spine36To38(obj: SpineSkeletonData): SpineSkeletonData;
