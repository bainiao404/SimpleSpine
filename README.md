# SimpleSpine

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=flat-square" alt="Release">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/PixiJS-v7.x-orange.svg?style=flat-square" alt="PixiJS">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat-square" alt="TypeScript">
</p>

**SimpleSpine** 是面向 PixiJS v7 的多版本 Spine 动画兼容适配与加载封装库。

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
- `dist/simplespine.js`：适合在浏览器中使用 `<script>` 标签直接引入的 IIFE 格式文件（全局暴露 `SimpleSpine` 命名空间）。
- `dist/simplespine.mjs`：适合 Vite / Webpack / ESM 模块化打包工具链的现代 ESM 包。

---

## 使用示例

### 1. 远程网络资源加载

通过指定骨骼资源的路径，加载器将并发自动拉取对应的 `.atlas` 和 `.png` 纹理集。

```javascript
import SimpleSpine, { registerPIXI } from 'simplespine';

// 1. 显式注册 PIXI 实例 (若在全局 window 环境下则已自动挂载)
registerPIXI(PIXI);

async function initSpine() {
  try {
    // 2. 外部路径加载 (支持自动侦测版本并映射为 3.8 标准渲染实例)
    const spineData = await SimpleSpine.load('assets/spineboy-pro.skel');
    
    // 3. 构建 PIXI.spine 渲染对象与调试辅助实例
    const { spine: spineCharacter, debug: spineDebug } = SimpleSpine.spine(spineData);
    
    // 4. 调整位置并添加至舞台
    spineCharacter.x = 400;
    spineCharacter.y = 600;
    spineCharacter.scale.set(0.5);
    app.stage.addChild(spineCharacter);

    // 5. 播放指定动画
    spineCharacter.state.setAnimation(0, 'walk', true);
  } catch (error) {
    console.error('Spine 加载失败:', error);
  }
}
```

### 2. 内存数据直接加载

对于已在运行期加载到内存中的资源，可直接传入 `MemorySpineSource` 结构实现零网络 IO 渲染。

```javascript
// 假设已从本地拖拽或加密接口拉取到数据
const mySkelBuffer = new Uint8Array([...]).buffer; // 骨骼 ArrayBuffer
const myAtlasText = "spineboy.png\nsize: 1024,256..."; // 图集配置字符串

const spineData = await SimpleSpine.load({
  skeletonData: mySkelBuffer, // 传入 ArrayBuffer (自动判定为 skel 二进制格式)
  atlasData: myAtlasText,
  texturePath: 'assets/'      // 纹理图片网络请求的基准目录 (也可直接通过 textureData 传入图片 base64/blob)
});

const { spine: spineCharacter } = SimpleSpine.spine(spineData);
app.stage.addChild(spineCharacter);
```

### 3. 骨骼调试线绘制

```javascript
const { spine, debug } = SimpleSpine.spine(spineData);

// 开启骨骼调试线和包围盒渲染
spine.debug = debug;

// 关闭调试线
spine.debug = null;
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
