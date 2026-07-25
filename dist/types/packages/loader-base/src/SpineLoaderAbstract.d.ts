import { Texture, Loader, TextureSource as BaseTexture } from 'pixi.js';
import { ISkeletonData, ISkeletonParser, TextureAtlas } from '@pixi-spine/base';
/**
 * This abstract class is used to create a spine loader specifically for a needed version
 * @public
 */
export declare abstract class SpineLoaderAbstract<SKD extends ISkeletonData> {
    constructor();
    abstract createJsonParser(): ISkeletonParser;
    abstract createBinaryParser(): ISkeletonParser;
    abstract parseData(parser: ISkeletonParser, atlas: TextureAtlas, dataToParse: any): ISpineResource<SKD>;
    installLoader(): any;
}
/**
 * The final spineData+spineAtlas object that can be used to create a Spine.
 * @public
 */
export interface ISpineResource<SKD extends ISkeletonData> {
    spineData: SKD;
    spineAtlas: TextureAtlas;
}
/**
 * Metadata for loading spine assets
 * @public
 */
export interface ISpineMetadata {
    spineSkeletonScale?: number;
    spineAtlas?: Partial<TextureAtlas>;
    spineAtlasAlias?: string[];
    spineAtlasFile?: string;
    atlasRawData?: string;
    imageLoader?: (loader: Loader, path: string) => (path: string, callback: (tex: BaseTexture) => any) => any;
    imageMetadata?: any;
    images?: Record<string, Texture | BaseTexture>;
    image?: Texture | BaseTexture;
}
