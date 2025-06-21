# SimpleSpine

基于PixiJS v7、Spine-Pixi 的 Spine整合，支持的spine版本：2.1、3.4、3.5、3.6、3.7、3.8、4.0、4.1、4.2

# 基本使用

引入必要文件：

<script src="src/pixi7.4.2.min.js"></script>
<script src="src/pixi-spine.js"></script>
<script src="src/SimpleSpine.js"></script>

加载spine:

<script>
    var app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window,
        backgroundColor: 0x2c3e50,
        hello: true,
    });
    document.body.appendChild(app.view);
    async function newSpine(src) {
        let spineData = await SimpleSpine.load(src);
        //自动判断预乘（如果你不知道纹理是否为预乘）
        //spineData.setPremultiplied();
        //设置为预乘图片
        //spineData.setPremultiplied(true);
        let mySpine = SimpleSpine.spine(spineData);
        //设置debug
        //mySpine.setDebug();
        let animation = mySpine.spine;
        app.stage.addChild(animation);
        //设置动画
        animation.state.setAnimation(0, 'run', true);
    }
    newSpine('assets/spine/spineboy.skel')
</script>
