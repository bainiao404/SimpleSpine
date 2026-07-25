# SimpleSpineNext

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=flat-square" alt="Release">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/PixiJS-v7.x-orange.svg?style=flat-square" alt="PixiJS">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat-square" alt="TypeScript">
</p>

**SimpleSpineNext** 是一个面向 PixiJS v7 的轻量级、高性能且健壮的 Spine 动画加载与版本适配器封装库。

它核心解决了多版本 Spine 资源在前端加载冲突的问题，能够对 **Spine v2.1 ~ v4.2** 导出的骨骼数据（无论是 `.skel` 二进制格式还是 `.json` 文本格式）进行**自动版本检测**与**平滑版本转换适配**，并提供一套简明一致的统一调用接口。

---

## ✨ 核心特性

- **🚀 自动版本检测 (Autodetect)**：根据骨骼数据的二进制魔数或 JSON 头信息，全自动分析出源文件 Spine 版本。
- **🔄 平滑向下兼容适配**：内置 legacy-to-v3.8 规范化适配层（如 skins 转 array、斜切角度和曲线拟合修正、skinnedmesh 向上兼容转换），免去频繁重导老旧美术资源的烦恼。
- **💾 直接消费内存数据 (Memory Load)**：全新支持直接传入已读入内存的 `ArrayBuffer`、`string` 或 `object` 进行脱网加载，极大方便了本地文件拖拽预览、网络预载集成以及端侧加密数据解密后直接加载的特殊场景。
- **🌐 彻底去全局 window 依赖 (SSR / Test Friendly)**：解耦对 `window.PIXI` 的直接引用。提供 `registerPIXI()` 注册器，支持在无浏览器环境（如 Node.js 单元测试、SSR 服务端渲染）中无缝运行。
- **TypeScript 强类型支持**：所有模块均使用 TypeScript 进行了完全重构，提供完整、详尽的类型声明与代码自动补全。
- **⚡ Esbuild 高效构建**：底层基于 Esbuild 实施秒级打包编译，同时导出 ESM 规范的 `.mjs` 模块与支持直接在浏览器 `<script>` 导入的 IIFE 全局对象 `.js`（已处理 esbuild 互操作代理以无缝共享网页全局的 `PIXI` 单例）。

---

## 📦 构建与集成

### 1. 编译打包

克隆本项目，安装依赖并执行构建脚本：

```bash
# 安装依赖
npm install

# 编译项目（输出至 dist 目录）
npm run build
```

编译产物包括：
- `dist/simplespine.js`：适合浏览器脚本引入的 IIFE 库文件（全局暴露 `SimpleSpine` 对象）。
- `dist/simplespine.mjs`：适合 Vite / Webpack / ESM 模块化打包工具链的现代 ESM 包。

---

## 🛠 快速上手

### 方式一：传统网络加载 (XHR Load)

通过指定骨骼资源的路径，加载器将并发自动拉取对应的 `.atlas` 和 `.png` 纹理集。

```javascript
import SimpleSpine, { registerPIXI } from 'simplespinenext';

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

### 方式二：直接消费内存数据 (Memory Load)

若您已经通过其他管理器或在离线环境下读取了资源内容，可直接传入 `MemorySpineSource` 结构进行“零网络 IO”渲染。

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

### 方式三：开启调试绘制线

```javascript
const { spine, debug } = SimpleSpine.spine(spineData);

// 开启骨骼调试线和包围盒渲染
spine.debug = debug;

// 关闭调试线
spine.debug = null;
```

---

## 📂 项目结构

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

## 📄 开源许可

本项目遵循 [MIT License](LICENSE) 开源许可协议。内部集成的不同版本 Spine Runtime 源码版权分属 Esoteric Software 所有，仅限在拥有合法 Spine 授权的项目中使用。
