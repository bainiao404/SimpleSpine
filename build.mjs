import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Read version from spine-pixi bundles/package.json
const pkgPath = './bundles/pixi-spine/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const compiled = new Date().toUTCString().replace(/GMT/g, 'UTC');
const bannerContent = `/*!
 * SimpleSpineNext - v${pkg.version}
 * Compiled ${compiled}
 *
 * Integrated spine-pixi runtime with SimpleSpine wrapper.
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

const external = ['@pixi/*'];

async function build() {
  console.log('🚀 Starting Esbuild compilation for SimpleSpineNext...');
  const startTime = Date.now();

  const baseConfig = {
    entryPoints: ['src/index.js'],
    bundle: true,
    sourcemap: true,
    minify: true,
    target: 'es2020',
    external,
    alias: aliases,
    banner: {
      js: bannerContent,
    },
  };

  // 1. Build ES6 module (.mjs)
  await esbuild.build({
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/simplespine.mjs',
  });
  console.log('✓ Created ESM Bundle: dist/simplespine.mjs');

  // 2. Build IIFE script (.js)
  await esbuild.build({
    ...baseConfig,
    format: 'iife',
    globalName: 'SimpleSpine',
    outfile: 'dist/simplespine.js',
  });
  console.log('✓ Created IIFE Script: dist/simplespine.js');

  console.log(`✨ Build finished in ${Date.now() - startTime}ms`);

  // Auto-export to FennecView
  const fennecViewDestDir = 'D:/Project/FennecView-Develop/appOriginal/FennecView/src/assets/SimpleSpineNext';
  const parentDir = path.dirname(fennecViewDestDir);
  if (fs.existsSync(parentDir)) {
    console.log(`\n📦 Exporting to FennecView: ${fennecViewDestDir}`);
    if (!fs.existsSync(fennecViewDestDir)) {
      fs.mkdirSync(fennecViewDestDir, { recursive: true });
    }
    fs.copyFileSync('dist/simplespine.mjs', path.join(fennecViewDestDir, 'simplespine.mjs'));
    fs.copyFileSync('dist/simplespine.js', path.join(fennecViewDestDir, 'simplespine.js'));
    fs.copyFileSync('dist/simplespine.mjs.map', path.join(fennecViewDestDir, 'simplespine.mjs.map'));
    fs.copyFileSync('dist/simplespine.js.map', path.join(fennecViewDestDir, 'simplespine.js.map'));
    
    // Write index.js bridge
    const indexJsContent = `import SimpleSpine from './simplespine.mjs';
export * from './simplespine.mjs';
export default SimpleSpine;
`;
    fs.writeFileSync(path.join(fennecViewDestDir, 'index.js'), indexJsContent, 'utf8');
    console.log('✓ Successfully exported to FennecView!');
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
