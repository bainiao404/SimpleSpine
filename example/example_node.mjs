/**
 * Node.js (v8) 离线渲染示例
 * 运行命令：node example_node.mjs
 */

// 1. 声明浏览器特征（必须在导入 @pixi/node 之前执行）
globalThis.navigator = { userAgent: 'node' };

const PIXI_ORIG = await import('@pixi/node');
const { default: SimplePixiSpine } = await import('../dist/simple-pixi-spine-node.mjs');
const fs = await import('fs');
const path = await import('path');

async function run() {
    try {
        console.log('1. 注册 PIXI 实例 (内部自动处理 ESM 只读代理)...');
        const PIXI = SimplePixiSpine.registerPIXI(PIXI_ORIG);

        console.log('2. 初始化 Pixi v8 Application...');
        const app = new PIXI.Application();
        await app.init({
            width: 800,
            height: 600,
            backgroundAlpha: 0, // 透明背景
            antialias: true,
        });

        // 初始化 Node 资源加载器
        await PIXI.Assets.init();

        console.log('3. 从本地磁盘读取 Spineboy 资源...');
        const skelData = fs.readFileSync('./spineboy-pro.skel');
        const atlasData = fs.readFileSync('./spineboy-pro.atlas', 'utf-8');

        console.log('4. 解析并载入数据 (Memory Load)...');
        const spineData = await SimplePixiSpine.load({
            skeletonData: skelData,
            atlasData: atlasData,
            texturePath: './'
        });

        console.log('5. 实例化骨骼并添加到舞台...');
        const spineInstanceObj = SimplePixiSpine.spine(spineData);
        const char = spineInstanceObj.spine;

        // 关闭自动步进，便于精确控制帧时间
        char.autoUpdate = false;

        // 调整大小和位置
        char.x = 400;
        char.y = 550;
        char.scale.set(0.5);
        app.stage.addChild(char);

        // 播放 walk 动画
        char.state.setAnimation(0, 'walk', true);

        // 6. 步进 0.5s 并进行渲染
        char.update(0.5);
        app.renderer.render(app.stage);

        console.log('7. 导出并保存为 PNG 图像...');
        const buffer = app.canvas.toBuffer('image/png');
        fs.writeFileSync('./output_spineboy.png', buffer);
        console.log('✓ 渲染成功！已输出保存至 ./output_spineboy.png');

        // 销毁实例释放内存
        app.destroy(true, { children: true });
        process.exit(0);

    } catch (err) {
        console.error('渲染失败:', err);
        process.exit(1);
    }
}

run();
