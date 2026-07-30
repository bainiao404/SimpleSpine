# simple-pixi-spine

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=flat-square" alt="Release">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/PixiJS-v7.x-orange.svg?style=flat-square" alt="PixiJS">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat-square" alt="TypeScript">
</p>

> 当前分支仅适用于 **PixiJS v7** 环境。若使用的是 **PixiJS v8**，请跳转使用 **[pixi8](https://github.com/bainiao404/simple-pixi-spine/tree/pixi8)** 分支。

**simple-pixi-spine** 是面向 PixiJS v7 的多版本 Spine 动画兼容适配与加载封装库。

该项目旨在解决多版本 Spine 骨骼资源在前端加载时的版本冲突与 API 兼容问题。支持对 **Spine v2.1 至 v4.2** 导出的骨骼数据（包括 `.skel` 二进制及 `.json` 文本格式）进行**自动版本识别**与**向下兼容性转换**，为上层应用提供统一的调用接口。

---

## 主要功能

- **版本自动识别 (Autodetect)**：解析骨骼数据的二进制魔数或 JSON 字段头部，自动识别源文件的 Spine 软件导出版本。
- **向下兼容性数据适配**：内置 legacy-to-v3.8 数据规范化逻辑（包括 `skins` 对象转换为数组结构、斜切剪切角与动画曲线拟合转换、遗留 `skinnedmesh` 到新版 `mesh` 类型的适配转换），无需重新导出历史骨骼资源。
- **支持非网络流式数据源 (Memory Load)**：支持直接加载内存中的 `ArrayBuffer`、`string` 或已解析的 `object`，满足本地拖拽预览、自定义资源加载管理及解密二进制流数据加载等使用场景。
- **无全局 window 依赖**：解耦代码中对全局 `window.PIXI` 的直接依赖，提供 `registerPIXI(pixi)` 注册接口，支持在 Node.js 测试环境、服务端渲染 (SSR) 等无全局 `window` 对象的环境运行。
- **TypeScript 类型支持**：使用 TypeScript 重构全部核心逻辑，提供完整的类型定义，保证强类型推导和代码补全。
- **多端产物编译**：基于 Esbuild 构建工具输出 ESM 规范文件 (`.mjs`) 与浏览器直接引用的 IIFE 文件 (`.js`)。针对浏览器全局环境，通过打包期 Proxy 映射插件解决了多组件环境下 `@pixi/*` 原生引用与全局 `PIXI` 实例的命名空间隔离与同步问题。

---

## 构建与集成

### 1. 编译打包

克隆本项目，安装依赖并执行构建脚本：

```bash
# 安装依赖
npm install

# 编译项目（输出至 dist 目录）
npm run build
```

编译产物包括：

- `dist/simple-pixi-spine.js`：适合在浏览器中使用 `<script>` 标签直接引入的 IIFE 格式文件（全局暴露 `SimplePixiSpine` 命名空间）。
- `dist/simple-pixi-spine.mjs`：适合 Vite / Webpack / ESM 模块化打包工具链的现代 ESM 包。
- `dist/simple-pixi-spine-node.mjs`：适合 Node.js 环境的 ESM 包，内部依赖已被替换绑定至 `@pixi/node`。

### 2. NPM 安装引入

本仓库已发布至 NPM。推荐在支持打包工具（如 Vite、Webpack 等）的现代前端项目中直接通过 npm 安装：

```bash
# 默认安装为主要版本（PixiJS v7 支持分支）
npm install simple-pixi-spine
```

并在代码中导入使用：

```javascript
import SimplePixiSpine, { registerPIXI } from "simple-pixi-spine";

// 显式注册 PIXI 实例（通常在初始化 PixiJS Application 后执行）
registerPIXI(PIXI);
```

> [!IMPORTANT]
> `simple-pixi-spine` 将 `@pixi/*` 相关包声明为 `peerDependencies`。安装前请确保您的项目已安装 PixiJS v7 相关的包。

---

## 使用示例

### 1. 默认网络资源加载

通过指定骨骼资源的路径，加载器将并发自动拉取同名 `.atlas` 和 `.png` 纹理集。

```javascript
import SimplePixiSpine, { registerPIXI } from "simple-pixi-spine";

// 1. 显式注册 PIXI 实例 (若在全局 window 环境下则已自动挂载)
registerPIXI(PIXI);

async function initSpine() {
    try {
        // 2. 外部路径加载 (支持自动侦测版本并映射为 3.8 标准渲染实例)
        const spineData = await SimplePixiSpine.load("assets/spineboy-pro.skel");

        // 3. 构建 PIXI.spine 渲染对象与调试辅助实例
        const { spine: spineCharacter, debug: spineDebug } = SimplePixiSpine.spine(spineData);

        // 4. 调整位置并添加至舞台
        spineCharacter.x = 400;
        spineCharacter.y = 600;
        spineCharacter.scale.set(0.5);
        app.stage.addChild(spineCharacter);

        // 5. 播放指定动画
        spineCharacter.state.setAnimation(0, "walk", true);
    } catch (error) {
        console.error("Spine 加载失败:", error);
    }
}
```

### 2. 异构网络路径配置加载

如果资源的 `.skel`/`.json`、`.atlas` 以及图片存放在不同的 CDN 目录或使用不同的后缀，可以通过配置对象进行显式覆盖：

```javascript
const spineData = await SimplePixiSpine.load({
    path: [
        "https://cdn.example.com/skeletons/hero_anim.skel", // 骨骼二进制数据路径
        "https://cdn.example.com/atlases/hero.atlas", // 图集配置路径
        "https://cdn.example.com/textures/", // 图片纹理基础 CDN 目录
    ],
});
```

或者使用 `options` 选项进行单项覆盖：

```javascript
const spineData = await SimplePixiSpine.load("assets/hero.json", {
    atlasPath: "custom/hero.atlas",
    texturePath: "custom/images/",
});
```

### 3. 纯内存数据加载

对于已在运行期下载或解密到内存中的资源，可直接传入 `MemorySpineSource` 结构实现零网络 IO 渲染。

```javascript
const mySkelBuffer = new Uint8Array([...]).buffer; // 骨骼二进制数据
const myAtlasText = "hero.png\nsize: 1024,256..."; // 图集配置文本

const spineData = await SimplePixiSpine.load({
  skeletonData: mySkelBuffer,
  atlasData: myAtlasText,
  // 此时图集内定义的贴图 hero.png 会自动向 assets/ 目录下请求拉取
  texturePath: 'assets/'
});
```

### 4. 本地文件拖拽离线加载 (Blob URL 模式)

在 Web 资源预览编辑器等离线应用中，可以通过拖拽读取本地 `File` 转化为 Blob URL，完全不需要服务器网络请求。

```javascript
// 假设通过 <input type="file" multiple> 获取到了本地文件对象
const skelFile = files.find((f) => f.name.endsWith(".skel"));
const atlasFile = files.find((f) => f.name.endsWith(".atlas"));
const pngFile = files.find((f) => f.name.endsWith(".png"));

// 读取骨骼和图集数据
const skelBuffer = await skelFile.arrayBuffer();
const atlasText = await atlasFile.text();

// 创建图片的本地临时 Blob 链接
const pngBlobUrl = URL.createObjectURL(pngFile);

const spineData = await SimplePixiSpine.load({
    skeletonData: skelBuffer,
    atlasData: atlasText,
    // 显式传入本地图集图片的映射信息
    textureData: [
        {
            name: pngFile.name, // 对应图集文本第二行定义的图片名称 (如 'hero.png')
            src: pngBlobUrl, // 本地 Blob URL
        },
    ],
});
```

### 5. 显式指定版本解析 (覆写自检测)

在少数老旧骨骼资源版本信息损坏或无法被加载器自动检测出来时，可以通过 `options.version` 显式指定解析的版本（如强制作为 `38` 或 `41` 版本解析）：

```javascript
const spineData = await SimplePixiSpine.load("assets/legacy_data.skel", {
    version: "38", // 覆写自动检测，强制按 Spine v3.8 规范解析
});
```

### 6. 骨骼调试线绘制

```javascript
const { spine, debug } = SimplePixiSpine.spine(spineData);

// 开启骨骼调试线和包围盒渲染
spine.debug = debug;

// 关闭调试线
spine.debug = null;
```

---

## Node.js (离线渲染/服务端) 支持

`simple-pixi-spine` 完整支持在 Node.js 环境下运行（例如进行服务器端渲染 (SSR)、自动化离线渲染出图或单元测试）。

### 1. 安装 Node.js 适配库
在 Node.js 环境中渲染需要使用官方提供的 `@pixi/node` 库（它在 Node 环境中提供了底层的 WebGL/Canvas 环境与 DOM Polyfills）：

```bash
npm install @pixi/node@^7.3.0 canvas gl @xmldom/xmldom cross-fetch
```

### 2. 导入与初始化说明
1. **声明浏览器特征**：由于 PixiJS 内部在加载时会立刻检测浏览器特征，在 Node 环境中执行 `import` 前**必须**先声明 `globalThis.navigator`，避免导入抛出 `navigator is not defined` 异常。
2. **注册全局实例**：使用 `registerPIXI(PIXI)` 接口将 `@pixi/node` 实例注册给库。由于 Node 中直接导入的 Module 命名空间是不可写的，需要先创建一个浅拷贝的 mutable `PIXI` 对象再调用注册。

### 3. Node.js (v7) 离线渲染完整示例

```javascript
// 1. 声明浏览器特征（必须在导入 @pixi/node 之前执行）
globalThis.navigator = { userAgent: 'node' };

const PIXI_ORIG = await import('@pixi/node');
const { default: SimplePixiSpine } = await import('simple-pixi-spine/dist/simple-pixi-spine-node.mjs');
const fs = await import('fs');
const path = await import('path');

async function renderSpine() {
    // 2. 创建可写的 PIXI 代理对象并注册
    const PIXI = {};
    for (const key of Object.getOwnPropertyNames(PIXI_ORIG)) {
        const desc = Object.getOwnPropertyDescriptor(PIXI_ORIG, key);
        if (desc) Object.defineProperty(PIXI, key, desc);
    }
    
    // 注册实例（自动完成 Node 环境下 PIXI.spine 各版本运行时的初始化挂载）
    SimplePixiSpine.registerPIXI(PIXI);

    // 3. 初始化 Pixi Application (v7 同步构造器语法)
    const app = new PIXI.Application({
        width: 1024,
        height: 1024,
        backgroundAlpha: 0, // 透明背景
        antialias: true,
    });

    // 4. 从本地磁盘读取骨骼和图集数据 (Memory Load 模式)
    const spineDir = './assets/spine_character';
    const skelData = fs.readFileSync(path.join(spineDir, 'character.skel'));
    const atlasData = fs.readFileSync(path.join(spineDir, 'character.atlas'), 'utf-8');

    const spineData = await SimplePixiSpine.load({
        skeletonData: skelData,
        atlasData: atlasData,
        texturePath: spineDir + '/' // 本地贴图所在的目录路径，末尾须带斜杠 '/'
    });

    // 5. 实例化骨骼并添加到舞台
    const spineInstanceObj = SimplePixiSpine.spine(spineData);
    const char = spineInstanceObj.spine;
    
    // 关闭自动更新以便手动控制渲染的帧
    char.autoUpdate = false;
    
    // 设置位置和大小
    char.x = 512;
    char.y = 900;
    char.scale.set(0.5);
    app.stage.addChild(char);

    // 播放 walk 动画
    char.state.setAnimation(0, 'walk', true);
    
    // 6. 手动步进动画并渲染 (如步进 0.5 秒)
    char.update(0.5);
    app.renderer.render(app.stage);

    // 7. 将 Node.js Canvas (app.view) 导出为本地 PNG 文件
    const pngBuffer = app.view.toBuffer('image/png');
    fs.writeFileSync('output_char.png', pngBuffer);
    console.log('Saved rendered frame to output_char.png');

    // 销毁实例释放内存
    app.destroy(true, { children: true });
}

renderSpine().catch(console.error);
```

---

## 项目结构

```text
├── bundles/                  # pixi-spine 官方包底层封装汇总层
├── dist/                     # 编译生成的前端分发包 (ESM & IIFE)
├── example/                  # 演示工程 (Spineboy v3.8 skel 交互演示)
├── packages/                 # vendored 官方各版本核心解析运行时 (v3.7 ~ v4.2)
├── src/                      # 核心重构 TypeScript 源码
│   ├── BinaryInput.ts        # 二进制数据流读取器
│   ├── SkelToJson.ts         # 旧版本适配器与数据格式规范化模块
│   ├── SkelToJsonCommon.ts   # 通用解析方法
│   ├── TextureHelper.ts      # 纹理贴图辅助处理逻辑
│   ├── VersionDetector.ts    # 骨骼二进制/JSON版本侦测模块
│   ├── index.ts              # 统一外部加载与适配主入口
│   └── types.ts              # TypeScript 类型声明与接口
├── build.mjs                 # 基于 Esbuild 的多模块打包构建脚本
└── tsconfig.json             # TypeScript 编译器配置文件
```

---

## 开源许可

本项目遵循 [MIT License](LICENSE) 开源许可协议。内部集成的不同版本 Spine Runtime 源码版权分属 Esoteric Software 所有，仅限在拥有合法 Spine 授权的项目中使用。
