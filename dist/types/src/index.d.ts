/**
 * 显式注册 PIXI 实例，以便在非浏览器/无全局 window 的环境下运行（如 SSR 或单元测试）
 * @param pixi - PIXI 实例
 */
export declare function registerPIXI(pixi: any): any;
/**
 * 获取当前的 PIXI 实例
 */
export declare function getPIXI(): any;
import { normalizeTo38, spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 } from './SkelToJson';
import { detectSpineVersion, isVersion, versionMap } from './VersionDetector';
import { TextureInfo, TextureData, MemorySpineSource } from './types';
export { normalizeTo38, spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 };
export { detectSpineVersion, isVersion, versionMap };
/**
 * 获取文件目录路径
 * @param src - 文件路径
 * @returns 目录路径，以 '/' 结尾
 */
export declare function getFileDirectory(src: string): string;
/**
 * 解析 Atlas 文本以获取纹理信息列表
 * @param atlasData - Atlas 文本内容
 */
export declare function getTextureAtlasInfo(atlasData: string): TextureInfo[];
/**
 * 提取骨骼、图集和纹理的完整访问路径
 * @param src - 资源来源路径或配置对象
 * @param options - 配置项
 */
export declare function getSpineSrc(src: any, options?: any): any;
/**
 * 构造纹理加载信息列表
 * @param atlasData - Atlas 文本
 * @param textureBasePath - 纹理基础目录路径
 */
export declare function prepareTextureData(atlasData: string, textureBasePath: string): TextureData[];
/**
 * 基于原生 XMLHttpRequest (AJAX) 请求文件
 * @param url - 目标 URL
 * @param responseType - 响应数据类型 (text, arraybuffer)
 * @param options - 配置参数，如 onProgress
 */
export declare function loadFile(url: string, responseType?: string, options?: any): Promise<{
    data: any;
    status: number;
}>;
/**
 * 核心解析方法：绑定纹理并调用对应版本的 Spine SDK 进行解析
 * @param config
 */
export declare function readSpineSpineData(config: any): Promise<any>;
/**
 * 数据预处理：执行版本检测、格式转换（skel -> json）以及跨版本兼容处理
 * @param params
 */
export declare function processSpineData(params: any): Promise<any>;
/**
 * 外部加载入口函数，支持加载网络 URL 路径或直接加载内存中的预拉取数据对象
 * @param src - 路径字符串、结构化的路径对象，或者 MemorySpineSource 内存资源对象
 * @param options - 配置项
 */
export declare function load(src: string | object | MemorySpineSource, options?: any): Promise<any>;
/**
 * 实例化 Spine 对象并附加调试渲染器
 * @param spineData - 由 load 方法返回的已处理数据对象
 */
export declare function spine(spineData: any): any;
declare let SimplePixiSpine: {
    load: typeof load;
    spine: typeof spine;
    loadFile: typeof loadFile;
    detectSpineVersion: typeof detectSpineVersion;
    isVersion: typeof isVersion;
    versionMap: Record<number, import("./types").VersionConfig>;
    registerPIXI: typeof registerPIXI;
    getPIXI: typeof getPIXI;
    normalizeTo38: typeof normalizeTo38;
};
export default SimplePixiSpine;
