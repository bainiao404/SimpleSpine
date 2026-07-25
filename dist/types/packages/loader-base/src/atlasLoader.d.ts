import { Loader } from '@pixi/assets';
import { BaseTexture } from '@pixi/core';
/**
 * Ugly function to promisify the spine texture atlas loader function.
 * @public
 */
export declare const makeSpineTextureAtlasLoaderFunctionFromPixiLoaderObject: (loader: Loader, atlasBasePath: string, imageMetadata: any) => (pageName: string, textureLoadedCallback: (tex: BaseTexture) => any) => Promise<void>;
