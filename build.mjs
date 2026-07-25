import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Read version from spine-pixi bundles/package.json
const pkgPath = './bundles/pixi-spine/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const compiled = new Date().toUTCString().replace(/GMT/g, 'UTC');
const bannerContent = `/*!
 * simple-pixi-spine - v${pkg.version}
 * Compiled ${compiled}
 *
 * Integrated spine-pixi runtime with SimplePixiSpine wrapper.
 * All rights reserved.
 */`;

const aliases = {
  '@pixi-spine/base': './packages/base/src/index.ts',
  '@pixi-spine/loader-3.8': './packages/loader-3.8/src/index.ts',
  '@pixi-spine/loader-4.0': './packages/loader-4.0/src/index.ts',
  '@pixi-spine/loader-4.1': './packages/loader-4.1/src/index.ts',
  '@pixi-spine/loader-4.2': './packages/loader-4.2/src/index.ts',
  '@pixi-spine/loader-base': './packages/loader-base/src/index.ts',
  '@pixi-spine/loader-uni': './packages/loader-uni/src/index.ts',
  '@pixi-spine/runtime-3.7': './packages/runtime-3.7/src/index.ts',
  '@pixi-spine/runtime-3.8': './packages/runtime-3.8/src/index.ts',
  '@pixi-spine/runtime-4.0': './packages/runtime-4.0/src/index.ts',
  '@pixi-spine/runtime-4.1': './packages/runtime-4.1/src/index.ts',
  '@pixi-spine/runtime-4.2': './packages/runtime-4.2/src/index.ts',
};

const pixiGlobalsPlugin = {
  name: 'pixi-globals',
  setup(build) {
    build.onResolve({ filter: /^@pixi\// }, args => {
      return { path: args.path, namespace: 'pixi-globals' };
    });
    build.onLoad({ filter: /.*/, namespace: 'pixi-globals' }, args => {
      return {
        contents: `
          const proxy = new Proxy({}, {
            get(target, prop) {
              if (prop === '__esModule') return true;
              const PIXI = (typeof window !== 'undefined' && window.PIXI) || (typeof global !== 'undefined' && global.PIXI);
              if (prop === 'default') return PIXI || proxy;
              return PIXI ? PIXI[prop] : undefined;
            },
            ownKeys(target) {
              const PIXI = (typeof window !== 'undefined' && window.PIXI) || (typeof global !== 'undefined' && global.PIXI);
              return PIXI ? Reflect.ownKeys(PIXI) : [];
            },
            getOwnPropertyDescriptor(target, prop) {
              const PIXI = (typeof window !== 'undefined' && window.PIXI) || (typeof global !== 'undefined' && global.PIXI);
              if (PIXI && prop in PIXI) {
                return {
                  enumerable: true,
                  configurable: true,
                  writable: true,
                  value: PIXI[prop]
                };
              }
              if (prop === '__esModule') {
                return {
                  enumerable: true,
                  configurable: true,
                  writable: true,
                  value: true
                };
              }
              return undefined;
            }
          });
          module.exports = proxy;
        `,
        loader: 'js',
      };
    });
  },
};

async function build() {
  console.log('🚀 Starting Esbuild compilation for SimplePixiSpine...');
  const startTime = Date.now();

  const baseConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
    minify: true,
    target: 'es2020',
    alias: aliases,
    banner: {
      js: bannerContent,
    },
  };

  // 1. Build ES6 module (.mjs) - Keep external dependencies
  await esbuild.build({
    ...baseConfig,
    format: 'esm',
    external: ['@pixi/*'],
    outfile: 'dist/simple-pixi-spine.mjs',
  });
  console.log('✓ Created ESM Bundle: dist/simple-pixi-spine.mjs');

  // 2. Build IIFE script (.js) - Inline external @pixi/* to global window.PIXI lookup
  await esbuild.build({
    ...baseConfig,
    format: 'iife',
    globalName: 'SimplePixiSpine',
    plugins: [pixiGlobalsPlugin],
    outfile: 'dist/simple-pixi-spine.js',
  });
  console.log('✓ Created IIFE Script: dist/simple-pixi-spine.js');

  console.log(`✨ Build finished in ${Date.now() - startTime}ms`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
