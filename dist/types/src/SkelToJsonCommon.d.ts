import { BinaryInput } from './BinaryInput';
import { SpineSkeletonData, AttachmentData, SkinData } from './types';
/**
 * Spine 各个版本解析器共用的公共底层读取与解析函数
 */
/**
 * 读取顶点权重与坐标数据
 */
export declare function readVertices(input: BinaryInput, attachment: AttachmentData, vertexCount: number): void;
/**
 * 解析单个 Attachment 数据 (v3.4 - v3.7)
 */
export declare function readAttachment(input: BinaryInput, attachmentName: string, skeletonData: SpineSkeletonData, nonessential: boolean): AttachmentData;
/**
 * 解析单个 Skin 数据 (v3.4 - v3.7)
 */
export declare function readSkin(input: BinaryInput, skeletonData: SpineSkeletonData, nonessential: boolean): SkinData | null;
/**
 * 解析动画数据 (v3.4 - v3.7)
 */
export declare function readAnimation(input: BinaryInput, skeletonData: SpineSkeletonData, skins: {
    name: string;
    data: SkinData | null;
}[], version?: number): any;
