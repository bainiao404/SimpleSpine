import { TextureAtlas } from '@pixi-spine/base';
import { ExtensionType, LoaderParserPriority, path, extensions } from 'pixi.js';
import type { ISpineMetadata } from './SpineLoaderAbstract';

type RawAtlas = string;

const spineTextureAtlasLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Normal,
        name: 'spine-atlas-loader',
    },

    test(url: string): boolean {
        return url.split('?')[0].split('#')[0].endsWith('.atlas');
    },

    async load(url: string): Promise<RawAtlas> {
        const response = await fetch(url);
        const txt = await response.text();
        return txt as RawAtlas;
    },

    testParse(asset: unknown, options: any): Promise<boolean> {
        const isExtensionRight = options.src && options.src.split('?')[0].split('#')[0].endsWith('.atlas');
        const isString = typeof asset === 'string';

        return Promise.resolve(isExtensionRight && isString);
    },

    async parse(asset: RawAtlas, options: any, loader: any): Promise<TextureAtlas> {
        const metadata: ISpineMetadata = options.data || {};
        let basePath = path.dirname(options.src);

        if (basePath && basePath.lastIndexOf('/') !== basePath.length - 1) {
            basePath += '/';
        }

        let resolve = null;
        let reject = null;
        const retPromise = new Promise<TextureAtlas>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        // Retval is going to be a texture atlas. However, we need to wait for its callback to resolve this promise.
        let retval;
        const resolveCallback = (newAtlas: TextureAtlas): void => {
            if (!newAtlas) {
                reject('Something went terribly wrong loading a spine .atlas file\nMost likely your texture failed to load.');
            }
            resolve(retval);
        };

        // if we have an already loaded pixi image in the image field, use that.
        if (metadata.image || metadata.images) {
            // merge the objects
            const pages = Object.assign(metadata.image ? { default: metadata.image } : {}, metadata.images);

            retval = new TextureAtlas(
                asset as RawAtlas,
                (line: any, callback: any) => {
                    const page = pages[line] || (pages.default as any);

                    if (page && page.source) callback(page.source);
                    else callback(page);
                },
                resolveCallback
            );
        } else {
            // We don't have ready to use pixi textures, we need to load them now!
            retval = new TextureAtlas(asset as RawAtlas, makeSpineTextureAtlasLoaderFunctionFromPixiLoaderObject(loader, basePath, metadata.imageMetadata), resolveCallback);
        }

        return (await retPromise) as TextureAtlas;
    },

    unload(atlas: TextureAtlas) {
        atlas.dispose();
    },
};

/**
 * Ugly function to promisify the spine texture atlas loader function.
 * @public
 */
export const makeSpineTextureAtlasLoaderFunctionFromPixiLoaderObject = (loader: any, atlasBasePath: string, imageMetadata: any) => {
    return async (pageName: string, textureLoadedCallback: (tex: any) => any): Promise<void> => {
        const url = path.normalize([...atlasBasePath.split('/'), pageName].join('/'));

        const texture = await loader.load({ src: url, data: imageMetadata });

        textureLoadedCallback(texture.source || texture);
    };
};

extensions.add(spineTextureAtlasLoader);
