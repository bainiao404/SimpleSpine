/**
 * SimpleSpine v0.2 主入口模块
 * 采用 ES6 模块化设计，提供 Spine 动画的加载、解析与实例化功能
 */
import * as pixiSpine from '../bundles/pixi-spine/src/index';

if (typeof window !== 'undefined') {
    const w = window as any;
    w.PIXI = w.PIXI || {};
    w.PIXI.spine = w.PIXI.spine || {};
    Object.assign(w.PIXI.spine, pixiSpine);
}

import { spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 } from './SkelToJson';
import { detectSpineVersion, isVersion, versionMap } from './VersionDetector';
import { TextureInfo, TextureData } from './types';

export { spine36To38, readSkeletonData36And37, readSkeletonData34And35, readSkeletonData21 };
export { detectSpineVersion, isVersion, versionMap };

import { isPremultiplied, isPremultipliedAlpha, resizeRgbaBuffer, premultipliedToStraight } from './TextureHelper';

const handlers: Record<string, Function> = {
    readSkeletonData21,
    readSkeletonData34And35,
    readSkeletonData36And37,
};

/**
 * 获取文件目录路径
 * @param src - 文件路径
 * @returns 目录路径，以 '/' 结尾
 */
export function getFileDirectory(src: string): string {
    if (typeof src !== 'string' || !src) return '';
    const normalizedPath = src.replace(/\\/g, '/');
    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    if (lastSlashIndex === -1) return '';
    return normalizedPath.substring(0, lastSlashIndex + 1);
}

/**
 * 解析 Atlas 文本以获取纹理信息列表
 * @param atlasData - Atlas 文本内容
 */
export function getTextureAtlasInfo(atlasData: string): TextureInfo[] {
    const lines = atlasData.split(/\r?\n/);
    const list: TextureInfo[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();
        if (
            lowerLine.endsWith('.png') ||
            lowerLine.endsWith('.jpg') ||
            lowerLine.endsWith('.jpeg') ||
            lowerLine.endsWith('.webp') ||
            lowerLine.includes('blob:')
        ) {
            const sizeLine = lines[i + 1] || '';
            const sizeMatch = sizeLine.match(/size\s*:\s*(\d+)\s*,\s*(\d+)/);
            list.push({
                name: line,
                width: sizeMatch ? parseInt(sizeMatch[1]) : 0,
                height: sizeMatch ? parseInt(sizeMatch[2]) : 0,
            });
        }
    }
    return list;
}

/**
 * 提取骨骼、图集和纹理的完整访问路径
 * @param src - 资源来源路径或配置对象
 * @param options - 配置项
 */
export function getSpineSrc(src: any, options: any = {}): any {
    if (!src) throw new Error('地址不存在');

    if (typeof src === 'string') {
        const isSkel = src.endsWith('.skel');
        if (!isSkel && !src.endsWith('.json')) throw new Error(`格式不支持: ${src}`);

        return {
            type: isSkel ? 'skel' : 'json',
            path: [
                src,
                options.atlasPath || src.replace(/\.(skel|json)$/, '.atlas'),
                options.texturePath || getFileDirectory(src),
            ],
            atlasPath: options.atlasPath,
            texturePath: options.texturePath,
        };
    }
    return {
        ...src,
        atlasPath: options.atlasPath || src.atlasPath || src.path[1],
        texturePath: options.texturePath || src.texturePath || src.path[2] || getFileDirectory(src.path[0]),
    };
}

/**
 * 构造纹理加载信息列表
 * @param atlasData - Atlas 文本
 * @param textureBasePath - 纹理基础目录路径
 */
export function prepareTextureData(atlasData: string, textureBasePath: string): TextureData[] {
    return getTextureAtlasInfo(atlasData).map((item) => {
        let srcUrl = item.name;
        if (
            !item.name.startsWith('blob:') &&
            !item.name.startsWith('http:') &&
            !item.name.startsWith('https:') &&
            !item.name.startsWith('data:')
        ) {
            srcUrl = textureBasePath + item.name;
        }
        return {
            name: item.name,
            src: srcUrl,
        };
    });
}

/**
 * 内部辅助：Promise 化的 BaseTexture 加载器
 * @private
 * @param url - 纹理图片 URL 地址
 */
function _loadBaseTexture(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const w = window as any;
        if (typeof w.PIXI === 'undefined') {
            return reject(new Error('全局 PIXI 对象不存在，请确保已加载 PixiJS'));
        }
        const bt = w.PIXI.BaseTexture.from(url);
        if (bt.valid) return resolve(bt);
        bt.once('loaded', () => resolve(bt));
        bt.once('error', () => reject(new Error(`纹理加载失败: ${url}`)));
    });
}

/**
 * 基于原生 XMLHttpRequest (AJAX) 请求文件
 * @param url - 目标 URL
 * @param responseType - 响应数据类型 (text, arraybuffer)
 * @param options - 配置参数，如 onProgress
 */
export function loadFile(url: string, responseType: string = 'text', options: any = {}): Promise<{ data: any; status: number }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = responseType as any;

        xhr.onload = () => {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                resolve({ data: xhr.response, status: xhr.status });
            } else {
                reject(new Error(`HTTP ${xhr.status} : ${url}`));
            }
        };

        if (options.onProgress) {
            xhr.onprogress = (e) => {
                if (e.lengthComputable) {
                    options.onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };
        }

        xhr.onerror = () => reject(new Error('网络请求错误'));
        xhr.send();
    });
}

/**
 * 核心解析方法：绑定纹理并调用对应版本的 Spine SDK 进行解析
 * @param config
 */
export async function readSpineSpineData(config: any): Promise<any> {
    const { version, type, skeletonData, atlasData, textureData, originalSpine } = config;
    const w = window as any;

    if (typeof w.PIXI === 'undefined' || !w.PIXI.spine) {
        throw new Error('未加载 PIXI.spine 插件');
    }

    const spineSdk = w.PIXI.spine[`spine${version}`] || w.PIXI.spine;

    // 建立纹理索引 Map，优化查询效率
    const atlasInfoList = getTextureAtlasInfo(atlasData);
    const atlasInfoMap = new Map(atlasInfoList.map((item) => [item.name, item]));

    // 1. 准备所有 BaseTexture
    await Promise.all(
        textureData.map(async (tex: any) => {
            if (!tex.name.includes('.')) tex.name += '.png';
            const info = atlasInfoMap.get(tex.name);
            if (!info) return;

            // 加载 BaseTexture
            if (tex.src) {
                tex.texture = await _loadBaseTexture(tex.src);
            } else if (tex.data) {
                let buffer = tex.data;
                if (tex.width !== info.width || tex.height !== info.height) {
                    if (isPremultipliedAlpha(buffer)) {
                        tex.texture.isPremultipliedToStraight = true;
                        buffer = premultipliedToStraight(buffer);
                    }
                    buffer = resizeRgbaBuffer(buffer, tex.width, tex.height, info.width, info.height);
                }
                tex.texture = w.PIXI.BaseTexture.fromBuffer(buffer, info.width, info.height);
            }

            // 强行校正尺寸以匹配 atlas 定义
            if (tex.texture && (tex.texture.width !== info.width || tex.texture.height !== info.height)) {
                tex.texture.setSize(info.width, info.height);
            }
        }),
    );

    // 2. 创建 TextureAtlas
    let spineAtlas: any;
    if (parseInt(version, 10) < 42) {
        spineAtlas = new w.PIXI.spine.TextureAtlas(atlasData, (line: string, callback: Function) => {
            const found = textureData.find((t: any) => t.name === line);
            callback(found ? found.texture : null);
        });
    } else {
        spineAtlas = new spineSdk.TextureAtlas(atlasData);
        for (const page of spineAtlas.pages) {
            const found = textureData.find((t: any) => t.name === page.name);
            if (found) {
                page.setTexture(spineSdk.SpineTexture.from(found.texture));
            }
        }
    }

    // 3. 解析骨架数据
    const attachmentLoader = new spineSdk.AtlasAttachmentLoader(spineAtlas);
    let parser: any;
    let finalData = skeletonData;

    if (type === 'skel') {
        parser = new spineSdk.SkeletonBinary(attachmentLoader);
        finalData = new Uint8Array(skeletonData);
    } else {
        parser = new spineSdk.SkeletonJson(attachmentLoader);
        if (typeof skeletonData === 'string') {
            finalData = JSON.parse(skeletonData);
        }
    }

    const spineResult = {
        spine: parser.readSkeletonData ? parser.readSkeletonData(finalData) : parser.SkeletonData(finalData),
        atlas: attachmentLoader,
        texture: textureData.map((t: any) => t.texture).filter(Boolean),
        originalSpine,
        version,
        setPremultiplied: function (isP?: boolean) {
            const needsP = isP || isPremultiplied(this.texture[0]);
            this.texture.forEach((t: any) => {
                if (t.isPremultipliedToStraight) return;
                t.isPremultipliedToStraight = true;
                t.alphaMode = needsP ? w.PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA : w.PIXI.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
            });
        },
    };

    return spineResult;
}

/**
 * 数据预处理：执行版本检测、格式转换（skel -> json）以及跨版本兼容处理
 * @param params
 */
export async function processSpineData(params: any): Promise<any> {
    const { version, skelData, atlasData, textureData } = params;
    const config = versionMap[version];
    if (!config) throw new Error(`不受支持的spine版本: ${version}`);

    let skeletonData = skelData;
    let originalSpine: any = null;

    const checkType = (val: any) => {
        if (val instanceof ArrayBuffer) return 'skel';
        if (typeof val === 'string') return 'json';
        return 'obj';
    };

    if (config.handler) {
        let currentType = checkType(skeletonData);
        if (currentType === 'skel') {
            const handlerFn = handlers[config.handler];
            if (handlerFn) {
                skeletonData = handlerFn(skelData);
            }
        }

        currentType = checkType(skeletonData);
        if (currentType === 'json') {
            skeletonData = JSON.parse(skeletonData);
        }

        if (checkType(skeletonData) === 'obj') {
            originalSpine = skeletonData;
            skeletonData = spine36To38(skeletonData);
        }
    }

    return readSpineSpineData({
        version: config.target,
        type: checkType(skeletonData),
        skeletonData,
        atlasData,
        textureData: Array.isArray(textureData) ? textureData : [textureData],
        originalSpine,
    });
}

/**
 * 外部加载入口函数
 * @param src - 路径字符串或结构化的路径对象
 * @param options - 配置项
 */
export async function load(src: any, options: any = {}): Promise<any> {
    const srcs = getSpineSrc(src, options);
    const skelFileType = srcs.type === 'skel' ? 'arraybuffer' : 'text';

    try {
        const [skelRes, atlasRes] = await Promise.all([
            loadFile(srcs.path[0], skelFileType, { onProgress: options.onProgress }),
            loadFile(srcs.atlasPath || srcs.path[1], 'text'),
        ]);

        const textureData = prepareTextureData(atlasRes.data, srcs.texturePath || srcs.path[2]);

        const version = detectSpineVersion({
            data: skelRes.data,
            type: srcs.type,
            fallbackVersion: srcs.version,
        });

        if (!version) throw new Error('未知版本号或者非spine文件');

        const processedData = await processSpineData({
            version,
            skelData: skelRes.data,
            atlasData: atlasRes.data,
            textureData,
            fileType: srcs.type,
        });

        return { ...processedData, info: srcs };
    } catch (error) {
        console.error('加载Spine资源失败:', error);
        throw error;
    }
}

/**
 * 实例化 Spine 对象并附加调试渲染器
 * @param spineData - 由 load 方法返回的已处理数据对象
 */
export function spine(spineData: any): any {
    const w = window as any;
    if (typeof w.PIXI === 'undefined' || !w.PIXI.spine) {
        throw new Error('未加载 PIXI.spine 插件');
    }

    const isV42 = spineData.version === '42' || spineData.version === 42;
    const sdk = isV42 ? w.PIXI.spine.spine42 : w.PIXI.spine;

    const spineInstance = isV42 ? new sdk.Spine({ skeletonData: spineData.spine }) : new sdk.Spine(spineData.spine);

    const debugRenderer = new sdk.SpineDebugRenderer();

    return {
        spine: spineInstance,
        debug: debugRenderer,
        setDebug: function () {
            this.spine.debug = this.debug;
        },
    };
}

let SimpleSpine = {
    load,
    spine,
    loadFile,
    detectSpineVersion,
    isVersion,
    versionMap,
};

if (typeof window !== 'undefined') {
    const w = window as any;
    w.SimpleSpine = w.SimpleSpine || SimpleSpine;
}

// 默认导出对象，方便在不支持命名导入的场景下使用
export default SimpleSpine;
