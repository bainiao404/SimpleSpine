import { ISkeletonData, ISkeletonParser, TextureAtlas } from '@pixi-spine/base';
import { ISpineResource, SpineLoaderAbstract } from '@pixi-spine/loader-base';
/**
 * @public
 */
export declare class SpineLoader extends SpineLoaderAbstract<ISkeletonData> {
    createBinaryParser(): ISkeletonParser;
    createJsonParser(): ISkeletonParser;
    parseData(parser: ISkeletonParser, atlas: TextureAtlas, dataToParse: any): ISpineResource<ISkeletonData>;
}
