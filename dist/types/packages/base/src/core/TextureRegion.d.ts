import type { Texture, Rectangle } from '@pixi/core';
/**
 * @public
 */
export declare function filterFromString(text: string): TextureFilter;
/**
 * @public
 */
export declare function wrapFromString(text: string): TextureWrap;
/**
 * @public
 */
export declare enum TextureFilter {
    Nearest = 9728,// WebGLRenderingContext.NEAREST
    Linear = 9729,// WebGLRenderingContext.LINEAR
    MipMap = 9987,// WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
    MipMapNearestNearest = 9984,// WebGLRenderingContext.NEAREST_MIPMAP_NEAREST
    MipMapLinearNearest = 9985,// WebGLRenderingContext.LINEAR_MIPMAP_NEAREST
    MipMapNearestLinear = 9986,// WebGLRenderingContext.NEAREST_MIPMAP_LINEAR
    MipMapLinearLinear = 9987
}
/**
 * @public
 */
export declare enum TextureWrap {
    MirroredRepeat = 33648,// WebGLRenderingContext.MIRRORED_REPEAT
    ClampToEdge = 33071,// WebGLRenderingContext.CLAMP_TO_EDGE
    Repeat = 10497
}
/**
 * @public
 */
export declare class TextureRegion {
    texture: Texture;
    size: Rectangle;
    names: string[];
    values: number[][];
    renderObject: any;
    get width(): number;
    get height(): number;
    get u(): number;
    get v(): number;
    get u2(): number;
    get v2(): number;
    get offsetX(): number;
    get offsetY(): number;
    get pixiOffsetY(): number;
    get spineOffsetY(): number;
    get originalWidth(): number;
    get originalHeight(): number;
    get x(): number;
    get y(): number;
    get rotate(): boolean;
    get degrees(): number;
}
