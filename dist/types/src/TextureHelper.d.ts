/**
 * 纹理与图像数据处理辅助模块
 */
export declare const INV_ALPHA_TABLE: Float32Array;
/**
 * 判断 RGBA 数组是否为预乘 Alpha 格式
 * @param imageData - RGBA 像素数据字节数组
 * @param tolerance - 容差范围值
 */
export declare function isPremultipliedAlpha(imageData: Uint8Array | Uint8ClampedArray, tolerance?: number): boolean;
/**
 * 探测 PIXI BaseTexture 是否为预乘纹理
 * @param baseTexture - PIXI.BaseTexture 实例或相关包装对象
 */
export declare function isPremultiplied(baseTexture: any): boolean;
/**
 * 图像重采样：将 RGBA 缓冲数据调整为目标尺寸（双线性插值或临近插值采样）
 * @param buffer - 原始 RGBA 数据缓冲
 * @param oldW - 原始宽度
 * @param oldH - 原始高度
 * @param newW - 目标宽度
 * @param newH - 目标高度
 */
export declare function resizeRgbaBuffer(buffer: Uint8Array, oldW: number, oldH: number, newW: number, newH: number): Uint8Array;
/**
 * 将预乘 Alpha (Premultiplied Alpha) 还原为直色 Alpha (Straight Alpha)
 * @param rgbaArray - 原始 RGBA 缓冲数组
 */
export declare function premultipliedToStraight(rgbaArray: Uint8Array | Uint8ClampedArray): Uint8Array;
