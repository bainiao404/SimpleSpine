/**
 * Node.js (v7) 离线渲染示例
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
        console.log('1. 创建可写的 PIXI 代理对象并注册...');
        const PIXI = {};
        for (const key of Object.getOwnPropertyNames(PIXI_ORIG)) {
            const desc = Object.getOwnPropertyDescriptor(PIXI_ORIG, key);
            if (desc) {
                Object.defineProperty(PIXI, key, desc);
            }
        }
        SimplePixiSpine.registerPIXI(PIXI);

        console.log('2. 初始化 Pixi v7 Application (同步构造器)...');
        const app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundAlpha: 0, // 透明背景
            antialias: true,
        });

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
        const buffer = app.view.toBuffer('image/png'); // v7 下使用 app.view
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
