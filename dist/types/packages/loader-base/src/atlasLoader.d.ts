/**
 * Ugly function to promisify the spine texture atlas loader function.
 * @public
 */
export declare const makeSpineTextureAtlasLoaderFunctionFromPixiLoaderObject: (loader: any, atlasBasePath: string, imageMetadata: any) => (pageName: string, textureLoadedCallback: (tex: any) => any) => Promise<void>;
