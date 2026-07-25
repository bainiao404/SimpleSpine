import { Texture } from 'pixi.js';
import { TextureFilter, TextureRegion, TextureWrap } from './TextureRegion';
import type { TextureSource as BaseTexture } from 'pixi.js';
import type { Disposable, StringMap } from './Utils';
/**
 * @public
 */
export declare class TextureAtlas implements Disposable {
    pages: TextureAtlasPage[];
    regions: TextureAtlasRegion[];
    constructor(atlasText?: string, textureLoader?: (path: string, loaderFunction: (tex: BaseTexture) => any) => any, callback?: (obj: TextureAtlas) => any);
    addTexture(name: string, texture: Texture): TextureAtlasRegion;
    addTextureHash(textures: StringMap<Texture>, stripExtension: boolean): void;
    addSpineAtlas(atlasText: string, textureLoader: (path: string, loaderFunction: (tex: BaseTexture) => any) => any, callback: (obj: TextureAtlas) => any): void;
    private load;
    findRegion(name: string): TextureAtlasRegion;
    dispose(): void;
}
/**
 * @public
 */
export declare class TextureAtlasPage {
    name: string;
    minFilter: TextureFilter;
    magFilter: TextureFilter;
    uWrap: TextureWrap;
    vWrap: TextureWrap;
    baseTexture: BaseTexture;
    width: number;
    height: number;
    pma: boolean;
    setFilters(): void;
}
/**
 * @public
 */
export declare class TextureAtlasRegion extends TextureRegion {
    page: TextureAtlasPage;
    name: string;
    index: number;
}
