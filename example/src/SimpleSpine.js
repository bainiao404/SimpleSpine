var SimpleSpine = {};
SimpleSpine.load  = async function(src, options = {}) {
    // 获取资源路径配置 
    const srcs = this.getSpineSrc(src,  options);
    const skelFileType = srcs.type  === "skel" ? "arraybuffer" : "text";
 
    try {
        // 并行加载骨架和atlas文件 
        const [skelRes, atlasRes] = await Promise.all([ 
            this.loadFile(srcs.path[0],skelFileType),
            this.loadFile(srcs.atlasPath  || srcs.path[1], 'text')
        ]);
 
        // 准备纹理数据 
        const textureData = this.prepareTextureData( 
            atlasRes.data,  
            srcs.texturePath  || srcs.path[2] 
        );
 
        // 检测Spine版本 
        const version = this.detectSpineVersion({ 
            data: skelRes.data, 
            type: srcs.type, 
            fallbackVersion: srcs.version  
        });
        if (!version) throw new Error("未知版本号或者非spine文件");
 
        // 处理Spine数据 
        const processedData = await this.processSpineData({ 
            version,
            skelData: skelRes.data, 
            atlasData: atlasRes.data, 
            textureData,
            fileType: srcs.type  
        });
 
        return {
            ...processedData,
            info: srcs 
        };
    } catch (error) {
        console.error(' 加载Spine资源失败:', error);
        throw error;
    }
};
SimpleSpine.spine = function(spineData){
    let spine = null
    let debug = null
    if(spineData.version == 42){
        spine = new PIXI.spine.spine42.Spine({skeletonData:spineData.spine});
        debug = new PIXI.spine.spine42.SpineDebugRenderer()
    }else{
        spine = new PIXI.spine.Spine(spineData.spine);
        debug = new PIXI.spine.SpineDebugRenderer()
    }
    return {
        spine,
        debug,
        setDebug:function () {
            this.spine.debug = this.debug
        }
    }
}
SimpleSpine.getSpineSrc  = function(src, options = {}) {
    // 参数校验 
    if (!src) throw new Error("地址不存在");
 
    // 处理字符串类型路径 
    if (typeof src === "string") {
        if (!src.endsWith(".skel")  && !src.endsWith(".json"))  {
            throw new Error(`匹配地址失败: ${src}`);
        }
 
        return {
            type: src.slice(-5)  === ".skel" ? "skel" : "json",
            path: [
                src,
                options.atlasPath  || src.slice(0,  -5) + ".atlas",
                options.texturePath  || this.getFileDirectory(src) 
            ],
            atlasPath: options.atlasPath,   // 自定义atlas路径 
            texturePath: options.texturePath   // 自定义纹理路径 
        };
    }
 
    // 处理对象类型配置 
    if (typeof src === "object") {
        // 验证必要字段 
        if (!src.type  || !src.path)  {
            throw new Error("解析地址格式错误：缺少type或path字段");
        }
 
        // 确保path数组长度足够 
        if (src.path.length  < 2) {
            throw new Error("解析地址格式错误：path数组至少需要包含骨架和atlas路径");
        }
 
        return {
            ...src,
            atlasPath: options.atlasPath  || src.atlasPath  || src.path[1], 
            texturePath: options.texturePath  || src.texturePath  || (src.path[2]  || this.getFileDirectory(src.path[0])) 
        };
    }
 
    throw new Error("不支持的src类型");
};
 
SimpleSpine.prepareTextureData  = function(atlasData, textureBasePath) {
    const atlasInfo = this.getTextureAtlasInfo(atlasData); 
    return atlasInfo.map(item  => ({
        name: item.name, 
        src: textureBasePath + item.name  
    }));
};

SimpleSpine.detectSpineVersion  = function({ data, type, fallbackVersion }) {
    let versionStr = "";
    if (type === "skel") {
        versionStr = this.uint8ArrayToString(new  Uint8Array(data).slice(0, 40));
    } else {
        try {
            versionStr = JSON.parse(data)
        } catch {}
    }
    return this.isVersion(versionStr)  || fallbackVersion;
};

/**
 * 基于 XMLHttpRequest 加载文件
 * @param {string} url - 资源地址 
 * @param {'text'|'json'|'arraybuffer'|'blob'} responseType - 响应类型 
 * @param {object} [options] - 高级选项
 * @param {function} [options.onProgress] - 进度回调(0-100)
 */
SimpleSpine.loadFile  = function(url, responseType = 'text', options = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET',  url, true);
        xhr.responseType  = responseType; // 直接使用现代浏览器支持的响应类型 
        xhr.onload  = () => {
            if (xhr.status  === 200) {
                resolve({
                    data: xhr.response, 
                    status: xhr.status, 
                    headers: new Map(
                        xhr.getAllResponseHeaders() 
                            .trim()
                            .split('\n')
                            .map(line => line.split(':  '))
                    )
                });
            } else {
                reject(new Error(`HTTP ${xhr.status}`)); 
            }
        };
 
        // 进度事件（需服务端返回Content-Length）
        if (typeof options.onProgress  === 'function') {
            xhr.addEventListener('progress',  (e) => {
                if (e.lengthComputable)  {
                    options.onProgress(Math.round((e.loaded  / e.total)  * 100));
                }
            });
        }
 
        xhr.onerror  = () => reject(new Error('Network error'));
        xhr.ontimeout  = () => reject(new Error(`Timeout after ${xhr.timeout}ms`)); 
        xhr.send(); 
    });
};

SimpleSpine.processSpineData  = async function( {version, skelData, atlasData, textureData,textureType='url'} ) {
    let fileType = "skel"
    const versionMap = {
        "20": { target: "38", handler: "readSkeletonData21" },
        "21": { target: "38", handler: "readSkeletonData21" },
        "34": { target: "38", handler: "readSkeletonData34And35" },
        "35": { target: "38", handler: "readSkeletonData34And35" },
        "36": { target: "38", handler: "readSkeletonData36And37" },
        "37": { target: "38", handler: "readSkeletonData36And37" },
        "38": { target: "38", handler: null },
        "40": { target: "40", handler: null },
        "41": { target: "41", handler: null },
        "42": { target: "42", handler: null }
    };
    const config = versionMap[version];
    if (!config) throw new Error(`不受支持的spine版本: ${version}`);
    let skeletonData = skelData;
    let originalSpine = null
    if (config.handler){
        if(checkType(skeletonData)  === 'skel'){
            skeletonData = this.skelToJson[config.handler](skelData);
        }
        if(checkType(skeletonData) == "json"){
            skeletonData = JSON.parse(skeletonData)
        }
        if(checkType(skeletonData) == "obj"){
            originalSpine = skeletonData
            skeletonData = this.skelToJson.spine36To38(skeletonData);
        }
    }
    fileType = checkType(skeletonData)
    function checkType(value) {
        if (value instanceof ArrayBuffer || 
            Object.prototype.toString.call(value)  === '[object ArrayBuffer]') {
          return 'skel';
        }
        if (typeof value === 'string' || value instanceof String) {
          return 'json';
        }
        if (Object.prototype.toString.call(value)  === '[object Object]' && 
            (!value.constructor  || value.constructor  === Object)) {
          return 'obj';
        }
        return 'Other';
    }
    return this.readSpineSpineData({
        version:config.target,
        type:fileType,
        skeletonData,
        atlasData,
        textureData:textureData,
        textureType,
        originalSpine,
    });
};
SimpleSpine.isPremultiplied = function (baseTexture) {
    if(Array.isArray(baseTexture)){baseTexture = baseTexture[0]}
    if(baseTexture.texture){baseTexture = baseTexture.texture}
    if(baseTexture.resource.source){
        const canvas = document.createElement('canvas'); 
        const ctx = canvas.getContext('2d',{ premultiplyAlpha: 'none' }); 
        canvas.width  = baseTexture.width; 
        canvas.height  = baseTexture.height; 
        ctx.drawImage(baseTexture.resource.source,  0, 0);
    
        const imageData = ctx.getImageData(0,  0, canvas.width,  canvas.height); 
        const data = imageData.data; 

        return isPremultipliedAlpha(data,tolerance = 20)        
    }else{
        return isPremultipliedAlpha(baseTexture.resource.data,tolerance = 2)
    }

    function isPremultipliedAlpha(imageData,tolerance) {
        for (let i = 0; i < imageData.length; i += 4) {
            const red = imageData[i];
            const green = imageData[i + 1];
            const blue = imageData[i + 2];
            const alpha = imageData[i + 3] + tolerance;
    
            if (red > alpha || green > alpha || blue > alpha) {
                return false; // 如果有任何一个像素的RGB值大于Alpha值，则不是预乘纹理
            }
        }
        return true; // 所有像素的RGB值都小于等于Alpha值，是预乘纹理
    }
}
SimpleSpine.premultipliedToStraight = function(rgbaArray) {
    const result = new Uint8Array(rgbaArray.length);
    for (let i = 0; i < rgbaArray.length; i += 4) {
        const alpha = rgbaArray[i + 3] / 255;
        if (alpha > 0) {
            result[i] = Math.min(255, Math.round(rgbaArray[i] / alpha)); // R
            result[i + 1] = Math.min(
                255,
                Math.round(rgbaArray[i + 1] / alpha)
            ); // G
            result[i + 2] = Math.min(
                255,
                Math.round(rgbaArray[i + 2] / alpha)
            ); // B
        } else {
            result[i] = result[i + 1] = result[i + 2] = 0; // Alpha=0时归零
        }
        result[i + 3] = rgbaArray[i + 3]; // 保留原始Alpha
    }
    return result;
}
SimpleSpine.getTextureAtlasInfo  = function(atlasData){
    let line = atlasData.split(/\r\n|\r|\n/);
    let list = []
    for(var i=0;i<line.length;i++){
        if(line[i] && line[i].indexOf(".png") != -1){
            list.push({
                name:line[i],
                width:line[i+1].replace("size: ","").replace("size:","").split(",")[0],
                height:line[i+1].replace("size: ","").replace("size:","").split(",")[1]
            })
        }
    }
    return list
}
SimpleSpine.readSpineSpineData  = function(config) {
    const {
        version,
        type,
        skeletonData,
        atlasData,
        textureData,
        textureType = "url",
        originalSpine
    } = config;
 
    const t = this;
    console.log(version)
    const spineSdk = PIXI.spine[`spine${version}`]; 
    
    return new Promise(async (resolve, reject) => {
        let spineAtlasInfo = null
        let spineResult = {
                spine: null,
                atlas: null,
                texture: [],
                originalSpine,
                version 
        };
        try {
            // 1. 处理纹理图集 
            spineAtlasInfo = t.getTextureAtlasInfo(atlasData);
             
            const spineAtlas = version < 42
                ? await loadLegacyAtlas() 
                : await loadModernAtlas();
 
            // 2. 创建附件加载器 
            spineResult.atlas  = new spineSdk.AtlasAttachmentLoader(spineAtlas);
 
            // 3. 解析骨架数据 
            spineResult.spine  = parseSkeletonData();
 
            // 4. 设置预乘alpha方法 
            spineResult.setPremultiplied  = function(isPremultiplied) {
                if (isPremultiplied || t.isPremultiplied(this.texture))  {
                    this.texture.forEach(texture  => {
                        texture.alphaMode  = PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA;
                    });
                }
            };
 
            resolve(spineResult);
        } catch (error) {
            console.error('Spine 数据加载失败:', error);
            reject(error);
        }
 
        function loadLegacyAtlas() {
            return new Promise((resolve, reject) => {
                let loadedCount = 0;
                const atlas = new PIXI.spine.TextureAtlas(atlasData,  async (line, callback) => {
                    setTimeout(function(){
                        const textureInfo = getTextureInfo(line);
                        loadTexture(textureInfo, texture => {
                            spineResult.texture.push(texture); 
                            loadedCount++;
                            
                            if (loadedCount >= spineAtlasInfo.length)  {
                                setTimeout(() => resolve(atlas));
                            }
                            callback(texture);
                        }, reject);                        
                    })
                });
            });
        }
 
        function loadModernAtlas() {
            return new Promise((resolve, reject) => {
                let loadedCount = 0;
                const atlas = new spineSdk.TextureAtlas(atlasData);
                
                atlas.pages.forEach(page  => {
                    const textureInfo = getTextureInfo(page.name); 
                    loadTexture(textureInfo, texture => {
                        spineResult.texture.push(texture); 
                        page.setTexture(spineSdk.SpineTexture.from(texture)); 
                        
                        if (++loadedCount >= spineAtlasInfo.length)  {
                            setTimeout(() => resolve(atlas));
                        }
                    }, reject);
                });
            });
        }
 
        function getTextureInfo(line) {
            if (spineAtlasInfo.length  === 1) {
                return {
                    type: textureType,
                    data: {
                        ...spineAtlasInfo[0],
                        ...(Array.isArray(textureData)  ? textureData[0] : textureData)
                    },
                    name: line,
                };
            }
            
            if (!Array.isArray(textureData)  || textureData.length  !== spineAtlasInfo.length)  {
                throw new Error("图片纹理不匹配");
            }
            
            const textureInfo = textureData.find(e  => e.name  === line);
            const mTextureInfo = spineAtlasInfo.find(e  => e.name  === line);
            if (!textureInfo && !mTextureInfo) {
                throw new Error(`缺失纹理: ${line}`);
            }
            
            return { type: textureType, data: {...mTextureInfo,...textureInfo}, name: line };
        }
 
        function loadTexture(info, success, fail) {
            try {
                const { data, width, height } = info.data;
                if (info.type  === "url") {
                    const src = info.data.src  || info.data;
                    const texture = PIXI.BaseTexture.from(src);
                    if(texture.valid){
                        success(texture)
                    }else{
                        texture.on('loaded',  () => success(texture));
                        texture.on('error',  fail);                        
                    }
                } else if (info.type  === "rgbaArray") {
                    success(PIXI.BaseTexture.fromBuffer(data,  width, height));
                }
            } catch (error) {
                fail(error);
            }
        }
 
        function parseSkeletonData() {
            let parser;
            let data = skeletonData;
            
            switch (type) {
                case "skel":
                case "binary":
                case "arrayBuffer":
                    parser = new spineSdk.SkeletonBinary(spineResult.atlas); 
                    data = new Uint8Array(data);
                    break;
                case "obj":
                    parser = new spineSdk.SkeletonJson(spineResult.atlas); 
                    break;
                case "json":
                    data = JSON.parse(data); 
                    parser = new spineSdk.SkeletonJson(spineResult.atlas); 
                    break;
                default:
                    throw new Error(`未知的骨架数据类型: ${type}`);
            }
            
            return parser.SkeletonData 
                ? parser.SkeletonData(data) 
                : parser.readSkeletonData(data); 
        }
    });
};
SimpleSpine.getFileDirectory  = function(src) {
    // 处理空值或非法输入 
    if (typeof src !== "string" || !src) return "";
 
    // 标准化路径分隔符（兼容Windows和Unix）
    const normalizedPath = src.replace(/\\/g,  '/');
 
    // 提取目录部分（通过最后一个'/'分割）
    const lastSlashIndex = normalizedPath.lastIndexOf('/'); 
    if (lastSlashIndex === -1) return ""; // 无目录结构 
    
    return normalizedPath.substring(0,  lastSlashIndex + 1);
};

SimpleSpine.uint8ArrayToString = function (u8Arr, encoding = "ascii") {
    return new TextDecoder(encoding).decode(u8Arr);
};
SimpleSpine.isVersion = function (str) {
    if (!str) {
        return null;
    }
    if (typeof str == "object") {
        if (str.skeleton && str.skeleton.spine) {
            if(str.skeleton.spine.length <= 3){
                return str.skeleton.spine.replace(".", "")
            }
            return str.skeleton.spine.slice(0, 3).replace(".", "");
        }
        return null;
    }
    if(typeof str == "string"){
        let list = [
            [9,"4.0"],
            [8,"4.1"],
            [9,"4.2"],
            [29,"3.8"],
            [29,"3.7"],
            [29,"3.6"],
            [29,"3.5"],
            [29,"3.4"]
        ]
        for(var i=0;i<list.length;i++){
            let a = str.slice(list[i][0],list[i][0]+6).match(/\d\.\d\.\d\d/g)
            console.log(a)
            if(a && a[0].startsWith(list[i][1])){
                return a[0].slice(0, 3).replace(".", "");
            }
        }        
    }
    // if (typeof str == "string") {
    //     if(str.length <= 3){
    //         return str.replace(".", "")
    //     }
    //     let vs = str.match(/\d\.\d\.\d\d/g);
    //     if (vs) {
    //         return vs[0].slice(0, 3).replace(".", "");
    //     }
    // }
    return null;
};
SimpleSpine.skelToJson = {};
SimpleSpine.skelToJson.BinaryInput = (function () {
    function BinaryInput(buffer) {
        this.index = 0;
        this.buffer = new DataView(buffer);
    }
    BinaryInput.prototype.readByte = function () {
        return this.buffer.getUint8(this.index++);
    };
    BinaryInput.prototype.readSByte = function () {
        return this.readByte();
    };
    BinaryInput.prototype.readShort = function () {
        var value = this.buffer.getInt16(this.index);
        this.index += 2;
        return value;
    };
    BinaryInput.prototype.readInt32 = function () {
        var value = this.buffer.getInt32(this.index);
        this.index += 4;
        return value;
    };
    BinaryInput.prototype.readVarint = function (optimizePositive) {
        let result = 0;
        let shift = 0;
        let b;

        do {
            b = this.readByte();
            result |= (b & 0x7f) << shift;
            shift += 7;
        } while ((b & 0x80) !== 0 && shift < 35);

        return optimizePositive ? result : (result >>> 1) ^ -(result & 1);
    };
    BinaryInput.prototype.readColor = function () {
        return {
            r: this.readByte(),
            g: this.readByte(),
            b: this.readByte(),
            a: this.readByte(),
        };
    };
    BinaryInput.prototype.readColorHex = function () {
        let color = this.readColor();
        return Hex(color.r) + Hex(color.g) + Hex(color.b) + Hex(color.a);
        function Hex(e) {
            let a = e.toString(16);
            return a.length == 2 ? a : "0" + a;
        }
    };
    BinaryInput.prototype.readStringRef = function () {
        var index = this.readVarint(true);
        return index == 0 ? null : this.strings[index - 1];
    };
    BinaryInput.prototype.readString = function () {
        let byteCount = this.readVarint(true);
        switch (byteCount) {
        case 0:
            return null;
        case 1:
            return "";
        }
        byteCount--;
        let chars = "";
        for (let i = 0; i < byteCount;) {
            let b = this.readByte();
            switch (b >> 4) {
            case 12:
            case 13:
                chars += String.fromCharCode(((b & 0x1F) << 6 | this.readByte() & 0x3F));
                i += 2;
                break;
            case 14:
                chars += String.fromCharCode(((b & 0x0F) << 12 | (this.readByte() & 0x3F) << 6 | this.readByte() & 0x3F));
                i += 3;
                break;
            default:
                chars += String.fromCharCode(b);
                i++;
            }
        }
        return chars;
    };
    BinaryInput.prototype.readFloat = function () {
        var value = this.buffer.getFloat32(this.index);
        this.index += 4;
        return value;
    };
    BinaryInput.prototype.readFloat21 = function () {
        return (
            (this.readByte() << 24) +
            (this.readByte() << 16) +
            (this.readByte() << 8) +
            (this.readByte() << 0)
        );
    };
    BinaryInput.prototype.readBoolean = function () {
        return this.readByte() != 0;
    };
    BinaryInput.prototype.readIntArray = function () {
        var n = this.readVarint(true);
        var array = new Array(n);
        for (var i = 0; i < n; i++) array[i] = this.readVarint(true);
        return array;
    };
    BinaryInput.prototype.readCurve = function () {
        switch (this.readByte()) {
            case 1: //CURVE_STEPPED
                return "stepped";
            case 2: //CURVE_BEZIER
                var cx1 = this.readFloat();
                var cy1 = this.readFloat();
                var cx2 = this.readFloat();
                var cy2 = this.readFloat();
                return [cx1, cy1, cx2, cy2];
        }
    };
    BinaryInput.prototype.readFloatArray = function (n) {
        if (!n) {
            n = this.readVarint(true);
        }
        var array = new Array(n);
        for (var i = 0; i < n; i++) {
            array[i] = this.readFloat();
        }
        return array;
    };
    BinaryInput.prototype.readAnimation = function (skeletonData, skins, version=36) {
        input = this;
        let animationData = {};
        let duration = 0;
        // Slot timelines.
        let slotData = {};
        const slotCount = input.readVarint(1);
        for (let i = 0, n = slotCount; i < n; ++i) {
            const slotIndex = input.readVarint(1);
            let slotMap = {};
            for (let ii = 0, nn = input.readVarint(1); ii < nn; ++ii) {
                const timelineType = input.readByte();
                const frameCount = input.readVarint(1);
                switch (timelineType) {
                    case 0: {
                        //SLOT_ATTACHMENT
                        const timeline = [];
                        for (
                            let frameIndex = 0;
                            frameIndex < frameCount;
                            ++frameIndex
                        ) {
                            let data = {
                                time: input.readFloat(),
                                name: input.readString(),
                            };
                            timeline.push(data);
                        }
                        slotMap.attachment = timeline;
                        duration = Math.max(
                            duration,
                            timeline[frameCount - 1].time
                        );
                        break;
                    }
                    case 1: {
                        //SLOT_COLOR
                        const timeline = [];
                        for (
                            let frameIndex = 0;
                            frameIndex < frameCount;
                            ++frameIndex
                        ) {
                            let data = {
                                time: input.readFloat(),
                                color: input.readColorHex(),
                            };
                            if (frameIndex < frameCount - 1) {
                                data.curve = input.readCurve();
                            }
                            timeline.push(data);
                        }
                        slotMap.color = timeline;
                        duration = Math.max(
                            duration,
                            timeline[frameCount - 1].time
                        );
                        break;
                    }
                    case 2: {
                        //SLOT_TWO_COLOR
                        let timeline = [];
                        timeline.slotIndex = slotIndex;
                        for (
                            let frameIndex = 0;
                            frameIndex < frameCount;
                            ++frameIndex
                        ) {
                            let data = {
                                time: input.readFloat(),
                                light: input.readColorHex(),
                                dark: input.readColorHex(),
                            };
                            if (frameIndex < frameCount - 1) {
                                data.curve = input.readCurve();
                            }
                            timeline.push(data);
                        }
                        slotMap.twoColor = timeline;
                        duration = Math.max(
                            duration,
                            timeline[frameCount - 1].time
                        );
                        break;
                    }
                    default:
                        return null;
                }
            }
            slotData[skeletonData.slots[slotIndex].name] = slotMap;
        }
        animationData.slots = slotData;

        // Bone timelines
        const boneData = {};

        const boneCount = input.readVarint(1);
        for (let i = 0; i < boneCount; i++) {
            const boneIndex = input.readVarint(1);
            const boneMap = {};
            const timelineCount = input.readVarint(1);

            for (let ii = 0; ii < timelineCount; ii++) {
                const timelineType = input.readByte();
                const frameCount = input.readVarint(1);

                const processFrame = (frameHandler) => {
                    const timeline = [];
                    for (
                        let frameIndex = 0;
                        frameIndex < frameCount;
                        frameIndex++
                    ) {
                        const data = frameHandler();
                        if (frameIndex < frameCount - 1) {
                            const curve = input.readCurve(data);
                            if (curve) data.curve = curve;
                        }
                        timeline.push(data);
                    }
                    return timeline;
                };

                switch (timelineType) {
                    case 0: {
                        // BONE_ROTATE
                        const timeline = processFrame(() => ({
                            time: input.readFloat(),
                            angle: input.readFloat(),
                        }));
                        boneMap.rotate = timeline;
                        duration = Math.max(
                            duration,
                            timeline[frameCount - 1].time
                        );
                        break;
                    }

                    case 1: // BONE_TRANSLATE
                    case 2: // BONE_SCALE
                    case 3: {
                        // BONE_SHEAR
                        const typeNames = ["", "translate", "scale", "shear"];
                        const timeline = processFrame(() => ({
                            time: input.readFloat(),
                            x: input.readFloat(),
                            y: input.readFloat(),
                        }));
                        boneMap[typeNames[timelineType]] = timeline;
                        break;
                    }

                    default:
                        return null;
                }
            }

            boneData[skeletonData.bones[boneIndex].name] = boneMap;
        }

        animationData.bones = boneData;

        let ikData = {};
        // IK constraint timelines.
        for (let i = 0, n = input.readVarint(1); i < n; ++i) {
            const index = input.readVarint(1);
            const frameCount = input.readVarint(1);
            const timeline = [];
            for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
                let data = {
                    time: input.readFloat(),
                    mix: input.readFloat(),
                    bendPositive: input.readByte() != 255,
                };
                switch(version){
                    case 37:
                        data.compress = input.readBoolean()
                        data.stretch = input.readBoolean()
                        break
                }
                if (frameIndex < frameCount - 1) {
                    let curve = input.readCurve();
                    if (curve) {
                        data.curve = curve;
                    }
                }
                timeline.push(data);
            }
            ikData[skeletonData.ik[index].name] = timeline;
        }
        animationData.ik = ikData;

        let transformData = {};
        // Transform constraint timelines.
        for (let i = 0, n = input.readVarint(1); i < n; ++i) {
            const index = input.readVarint(1);
            const frameCount = input.readVarint(1);
            const timeline = [];
            
            for (let frameIndex = 0; frameIndex < frameCount; ++frameIndex) {
                let data = {
                    time: input.readFloat(),
                    rotateMix: input.readFloat(),
                    translateMix: input.readFloat(),
                    scaleMix: input.readFloat(),
                    shearMix: input.readFloat(),
                };
                if (frameIndex < frameCount - 1) {
                    data.curve = input.readCurve();
                }
                timeline.push(data);
            }
            transformData[skeletonData.transform[index].name] = timeline; //暂时不知道名称来自那个键
        }
        animationData.transform = transformData;

        // Path constraint timelines
        const pathData = {};

        const pathCount = input.readVarint(1);
        for (let i = 0; i < pathCount; i++) {
            const pathIndex = input.readVarint(1);
            const timelineCount = input.readVarint(1);
            const pathName = skeletonData.path[pathIndex].name;

            pathData[pathName] = {};

            for (let ii = 0; ii < timelineCount; ii++) {
                const timelineType = input.readByte();
                const frameCount = input.readVarint(1);
                const timelineTypeNames = ["position", "spacing", "mix"];
                const timelineTypeName = timelineTypeNames[timelineType];

                const processFrame = (frameHandler) => {
                    const timeline = [];
                    for (
                        let frameIndex = 0;
                        frameIndex < frameCount;
                        frameIndex++
                    ) {
                        const data = frameHandler();
                        if (frameIndex < frameCount - 1) {
                            const curve = input.readCurve();
                            if (curve) data.curve = curve;
                        }
                        timeline.push(data);
                    }
                    return timeline;
                };

                let timeline;
                switch (timelineType) {
                    case 0: // PATH_POSITION
                    case 1: // PATH_SPACING
                        timeline = processFrame(() => ({
                            time: input.readFloat(),
                            position: input.readFloat(),
                        }));
                        break;

                    case 2: // PATH_MIX
                        timeline = processFrame(() => ({
                            time: input.readFloat(),
                            rotateMix: input.readFloat(),
                            translateMix: input.readFloat(),
                        }));
                        break;

                    default:
                        return null; // Invalid timeline type
                }

                pathData[pathName][timelineTypeName] = timeline;
                duration = Math.max(duration, timeline[frameCount - 1].time);
            }
        }

        animationData.paths = pathData;

        // Deform timelines
        const deformData = {};

        const processDeformFrames = (frameCount) => {
            const timeline = [];
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                const data = { time: input.readFloat() };
                const vertexCount = input.readVarint(1);

                if (vertexCount > 0) {
                    const startOffset = input.readVarint(1);
                    const vertices = Array.from({ length: vertexCount }, () =>
                        input.readFloat()
                    );
                    data.vertices = vertices;
                    data.offset = startOffset;
                }

                if (frameIndex < frameCount - 1) {
                    data.curve = input.readCurve(input, data, frameIndex);
                }

                timeline.push(data);
            }
            return timeline;
        };

        function getAttachment (attachments, meshName){
            for(var attachmentName in attachments){
                if(attachments[attachmentName].name == meshName)
                    return attachment = attachments[attachmentName];
            } 
        }

        const skinCount = input.readVarint(1);
        for (let i = 0; i < skinCount; i++) {
            const skinIndex = input.readVarint(1);
            const skin = skins[skinIndex].data;
            const skinMap = {};

            const slotCount = input.readVarint(1);
            for (let ii = 0; ii < slotCount; ii++) {
                const slotIndex = input.readVarint(1);
                const slotName = skeletonData.slots[slotIndex].name;
                const slot = {};

                const attachmentCount = input.readVarint(1);
                for (let iii = 0; iii < attachmentCount; iii++) {
                    const attachmentName = input.readString();
                    let attachments = skin[slotName]
                    let attachment = getAttachment(attachments,attachmentName)
                    if (!attachment) throw new Error("匹配deform中的attachment失败");

                    const frameCount = input.readVarint(1);
                    const timeline = processDeformFrames(frameCount);

                    slot[attachmentName] = timeline;
                    duration = Math.max(
                        duration,
                        timeline[frameCount - 1].time
                    );
                }

                skinMap[slotName] = slot;
            }

            deformData[skins[skinIndex].name] = skinMap;
        }

        animationData.deform = deformData;

        // Draw order timeline.
        const drawOrderCount = input.readVarint(1);
        if (drawOrderCount) {
            let drawOrders = [];
            for (let i = 0; i < drawOrderCount; ++i) {
                let drawOrderMap = {};
                let time = input.readFloat();
                let offsetCount = input.readVarint(1);
                let offsets = [];
                for (let ii = 0; ii < offsetCount; ++ii) {
                    const slotIndex = input.readVarint(1);

                    let data = {
                        slot: skeletonData.slots[slotIndex].name,
                        offset: input.readVarint(1),
                    };
                    offsets.push(data);
                }
                drawOrderMap.offsets = offsets;
                drawOrderMap.time = time;

                drawOrders.push(drawOrderMap);
            }
            duration = Math.max(duration, drawOrders[drawOrderCount - 1].time);
            animationData.drawOrder = drawOrders;
        }

        // Event timeline.
        //let events = {}
        const eventCount = input.readVarint(1);
        if (eventCount) {
            const timeline = [];
            for (let i = 0; i < eventCount; ++i) {
                let time = input.readFloat();
                let name = Object.keys(skeletonData.events)[
                    input.readVarint(1)
                ];
                const event = {}; //spEvent_create(time, eventData);
                event.int = input.readVarint(0);
                event.float = input.readFloat();
                event.string = input.readBoolean() ? input.readString() : name;
                event.time = time;
                event.name = name;
                timeline.push(event);
            }
            animationData.events = timeline;
            duration = Math.max(duration, timeline[eventCount - 1].time);
        }
        //animationData.events = events
        Object.keys(animationData).forEach((key) => {
            if (Object.keys(animationData[key]).length === 0) {
                delete animationData[key];
            }
        });

        return animationData;
    };
    BinaryInput.prototype.readAnimation21 = function (skeletonData, skins) {
        input = this;
        let animationData = {};
        let duration = 0;

        // Slot timelines
        const slotData = {};
        const slotCount = input.readVarint(true);

        for (let i = 0; i < slotCount; i++) {
            const slotIndex = input.readVarint(true);
            const timelineMap = {};
            const timelineCount = input.readVarint(true);

            for (let ii = 0; ii < timelineCount; ii++) {
                const timelineType = input.readByte();
                const frameCount = input.readVarint(true);
                const timeline = new Array(frameCount);

                // 统一帧数据处理逻辑
                for (
                    let frameIndex = 0;
                    frameIndex < frameCount;
                    frameIndex++
                ) {
                    const time = input.readFloat();
                    timeline[frameIndex] = { time };

                    switch (timelineType) {
                        case 3: // TIMELINE_ATTACHMENT
                            timeline[frameIndex].name = input.readString();
                            break;

                        case 4: // TIMELINE_COLOR
                            timeline[frameIndex].color = input.readColorHex();
                            if (frameIndex < frameCount - 1) {
                                input.readCurve(frameIndex, timeline);
                            }
                            break;

                        default:
                            console.error(
                                `Invalid  timeline type ${timelineType} for slot: ${skeletonData.slots[slotIndex].name}`
                            );
                            return null;
                    }
                }
                timelineMap[timelineType === 3 ? "attachment" : "color"] =
                    timeline;
                duration = Math.max(duration, timeline[frameCount - 1].time);
            }

            slotData[skeletonData.slots[slotIndex].name] = timelineMap;
        }

        animationData.slots = slotData;

        // Bone timelines
        const boneData = {};
        const boneCount = input.readVarint(true);

        for (let i = 0; i < boneCount; i++) {
            const boneIndex = input.readVarint(true);
            const timelines = {};
            const timelineCount = input.readVarint(true);

            for (let ii = 0; ii < timelineCount; ii++) {
                const type = input.readByte();
                const frameCount = input.readVarint(true);
                const timeline = new Array(frameCount);

                // 统一帧数据读取逻辑
                for (
                    let frameIndex = 0;
                    frameIndex < frameCount;
                    frameIndex++
                ) {
                    const frame = { time: input.readFloat() };

                    switch (type) {
                        case 1: // ROTATE
                            frame.angle = input.readFloat();
                            break;

                        case 2: // TRANSLATE
                        case 0: // SCALE
                            frame.x = input.readFloat();
                            frame.y = input.readFloat();
                            break;

                        case 5: // FLIPX
                        case 6: // FLIPY
                            frame[type === 5 ? "x" : "y"] = input.readBoolean();
                            break;

                        default:
                            console.error(
                                `Invalid  bone timeline type ${type} for: ${skeletonData.bones[boneIndex].name}`
                            );
                            return null;
                    }

                    if (frameIndex < frameCount - 1) {
                        const curve = input.readCurve(frameIndex, timeline);
                        if (curve) frame.curve = curve;
                    }

                    timeline[frameIndex] = frame;
                    duration = Math.max(duration, frame.time);
                }
                timelines[
                    type === 1
                        ? "rotate"
                        : type === 0
                        ? "scale"
                        : type === 2
                        ? "translate"
                        : type === 5
                        ? "flipX"
                        : "flipY"
                ] = timeline;
            }

            boneData[skeletonData.bones[boneIndex].name] = timelines;
        }

        animationData.bones = boneData;

        const ikData = {};
        const ikCount = input.readVarint(true);

        for (let i = 0; i < ikCount; i++) {
            const constraintIndex = input.readVarint(true);
            const frameCount = input.readVarint(true);
            const timeline = new Array(frameCount);
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                const frame = {
                    time: input.readFloat(),
                    mix: input.readFloat(),
                    bendPositive: input.readByte() !== 0xff, // 255转布尔
                };
                if (frameIndex < frameCount - 1) {
                    const curve = input.readCurve(frameIndex, timeline);
                    if (curve) frame.curve = curve;
                }
                timeline[frameIndex] = frame;
            }
            if (skeletonData.ik[constraintIndex]) {
                ikData[skeletonData.ik[constraintIndex].name] = timeline;
            } else {
                console.warn(
                    `Missing  IK constraint index: ${constraintIndex}`
                );
            }
        }

        // FFD timelines.
        var ffd = {};
        for (var i = 0, n = input.readVarint(true); i < n; i++) {
            var skinIndex = input.readVarint(true);
            var slotMap = {};
            for (var ii = 0, nn = input.readVarint(true); ii < nn; ii++) {
                var slotIndex = input.readVarint(true);
                var meshMap = {};
                for (
                    var iii = 0, nnn = input.readVarint(true);
                    iii < nnn;
                    iii++
                ) {
                    var meshName = input.readString();
                    var frameCount = input.readVarint(true);
                    var attachment;
                    var attachments =
                        skeletonData.skins[skins[skinIndex].name][
                            skeletonData.slots[slotIndex].name
                        ];
                    for (var attachmentName in attachments) {
                        if (attachments[attachmentName].name == meshName)
                            attachment = attachments[attachmentName];
                    }
                    if (!attachment)
                        console.log("FFD attachment not found: " + meshName);
                    var timeline = new Array(frameCount);
                    for (
                        var frameIndex = 0;
                        frameIndex < frameCount;
                        frameIndex++
                    ) {
                        var time = input.readFloat();
                        var vertexCount;
                        if (attachment.type == "mesh") {
                            vertexCount = attachment.vertices.length;
                        } else {
                            vertexCount = attachment.uvs.length * 3 * 3;
                            // This maybe wrong
                        }

                        var vertices = new Array(vertexCount);
                        for (
                            var verticeIdx = 0;
                            verticeIdx < vertexCount;
                            verticeIdx++
                        ) {
                            vertices[verticeIdx] = 0.0;
                        }
                        var bugFixMultiplicator = 0.1;

                        var end = input.readVarint(true);
                        if (end == 0) {
                            if (attachment.type == "mesh") {
                                for (
                                    var verticeIdx = 0;
                                    verticeIdx < vertexCount;
                                    verticeIdx++
                                ) {
                                    vertices[verticeIdx] +=
                                        attachment.vertices[verticeIdx] *
                                        bugFixMultiplicator;
                                }
                            }
                        } else {
                            var start = input.readVarint(true);
                            end += start;

                            for (var v = start; v < end; v++) {
                                vertices[v] = input.readFloat() * scale;
                            }

                            if (attachment.type == "mesh") {
                                var meshVertices = attachment.vertices;
                                for (
                                    var v = 0, vn = vertices.length;
                                    v < vn;
                                    v++
                                ) {
                                    vertices[v] +=
                                        meshVertices[v] * bugFixMultiplicator;
                                }
                            }
                        }
                        timeline[frameIndex] = {};
                        timeline[frameIndex].time = time;
                        timeline[frameIndex].vertices = vertices;
                        if (frameIndex < frameCount - 1)
                            input.readCurve(frameIndex, timeline);
                    }
                    meshMap[meshName] = timeline;
                    duration = Math.max(
                        duration,
                        timeline[frameCount - 1].time
                    );
                }
                slotMap[skeletonData.slots[slotIndex].name] = meshMap;
            }
            ffd[skins[skinIndex].name] = slotMap;
        }
        animationData.ffd = ffd;

        // Draw order timeline.
        const drawOrderCount = input.readVarint(1);
        if (drawOrderCount) {
            let drawOrders = [];
            for (let i = 0; i < drawOrderCount; ++i) {
                let drawOrderMap = {};

                let offsetCount = input.readVarint(1);
                let offsets = [];
                for (let ii = 0; ii < offsetCount; ++ii) {
                    const slotIndex = input.readVarint(1);

                    let data = {
                        slot: skeletonData.slots[slotIndex].name,
                        offset: input.readVarint(1),
                    };
                    offsets.push(data);
                }
                drawOrderMap.offsets = offsets;
                let time = input.readFloat();
                drawOrderMap.time = time;

                drawOrders.push(drawOrderMap);
            }
            duration = Math.max(duration, drawOrders[drawOrderCount - 1].time);
            animationData.drawOrder = drawOrders;
        }

        // Event timeline.
        //let events = {}
        const eventCount = input.readVarint(1);
        if (eventCount) {
            const timeline = [];
            for (let i = 0; i < eventCount; ++i) {
                let time = input.readFloat();
                let name = Object.keys(skeletonData.events)[
                    input.readVarint(1)
                ];
                const event = {}; //spEvent_create(time, eventData);
                event.int = input.readVarint(0);
                event.float = input.readFloat();
                event.string = input.readBoolean() ? input.readString() : name;
                event.time = time;
                event.name = name;
                timeline.push(event);
            }
            animationData.events = timeline;
            duration = Math.max(duration, timeline[eventCount - 1].time);
        }
        //animationData.events = events
        Object.keys(animationData).forEach((key) => {
            if (Object.keys(animationData[key]).length === 0) {
                delete animationData[key];
            }
        });

        return animationData;
    };
    BinaryInput.prototype.readSkin = function (skeletonData, nonessential) {
        let input = this;
        const slotCount = input.readVarint(1);
        if (slotCount === 0) {
            return null;
        }
        let skin = {};
        for (let i = 0; i < slotCount; ++i) {
            const slotIndex = input.readVarint(1);
            const nn = input.readVarint(1);
            let slot = {};
            for (let ii = 0; ii < nn; ++ii) {
                const name = input.readString();
                const attachment = spSkeletonBinary_readAttachment(
                    name,
                    skeletonData,
                    nonessential
                );
                if (attachment) {
                    slot[name] = attachment;
                }
                skin[skeletonData.slots[slotIndex].name] = slot;
            }
        }
        return skin;
        function spSkeletonBinary_readAttachment(
            attachmentName,
            skeletonData,
            nonessential
        ) {
            let name = input.readString();
            //console.log(attachmentName,name)
            let freeName = name !== null;

            if (!name) {
                freeName = false;
                name = attachmentName;
            }

            const type = input.readByte();

            let typeMode = [
                "region",
                "boundingbox",
                "mesh",
                "linkedmesh",
                "path",
                "point",
                "clipping",
            ];
            let attachment;
            switch (type) {
                case 0: {
                    //SP_ATTACHMENT_REGION
                    let path = input.readString();
                    let region;
                    if (!path) {
                        path = name;
                    }
                    attachment = {
                        //name: name,
                    };
                    region = attachment;
                    region.path = path;
                    region.rotation = input.readFloat();
                    region.x = input.readFloat();
                    region.y = input.readFloat();
                    region.scaleX = input.readFloat();
                    region.scaleY = input.readFloat();
                    region.width = input.readFloat();
                    region.height = input.readFloat();
                    region.color = input.readColorHex();
                    break;
                }
                case 1: {
                    //SP_ATTACHMENT_BOUNDING_BOX
                    const vertexCount = input.readVarint(1);
                    attachment = {
                        //name: name,
                        type: "boundingbox",
                        vertexCount: vertexCount,
                    };
                    input.readVertices(attachment, vertexCount);

                    if (nonessential) {
                        attachment.color = input.readColorHex();
                    }
                    break;
                }
                case 2: {
                    //SP_ATTACHMENT_MESH
                    let mesh;
                    let path = input.readString();

                    if (!path) {
                        path = name;
                    }
                    mesh = {
                        //name: name,
                        path: path,
                        color: input.readColorHex(),
                        vertexCount: input.readVarint(1),
                    };
                    mesh.uvs = input.readFloatArray(mesh.vertexCount * 2, 1);
                    mesh.triangles = input.readShortArray(
                        input,
                        mesh.trianglesCount
                    );
                    input.readVertices(mesh, mesh.vertexCount);
                    mesh.hull = input.readVarint(1); // * 2;

                    if (nonessential) {
                        mesh.edges = input.readShortArray(
                            input,
                            mesh.edgesCount
                        );
                        mesh.width = input.readFloat();
                        mesh.height = input.readFloat();
                    }
                    attachment = mesh;
                    break;
                }
                case 3: {
                    //SP_ATTACHMENT_LINKED_MESH
                    attachment = {};
                    let mesh = attachment;
                    let path = input.readString();
                    if (!path) {
                        path = name;
                    }

                    mesh.path = path;
                    mesh.color = input.readColorHex();
                    mesh.skin = input.readString();
                    mesh.parent = input.readString();
                    mesh.inheritDeform = input.readBoolean();

                    if (nonessential) {
                        mesh.width = input.readFloat(input);
                        mesh.height = input.readFloat(input);
                    }
                    break;
                }
                case 4: {
                    //SP_ATTACHMENT_PATH
                    attachment = {};
                    let path = attachment;
                    path.closed = input.readBoolean();
                    path.constantSpeed = input.readBoolean();
                    let vertexCount = input.readVarint(1);
                    path.vertexCount = vertexCount;
                    input.readVertices(path, vertexCount);
                    let lengthsLength = vertexCount / 3;
                    path.lengths = new Array(lengthsLength);
                    for (let i = 0; i < lengthsLength; ++i) {
                        path.lengths[i] = input.readFloat();
                    }
                    if (nonessential) {
                        path.color = input.readColorHex();
                    }
                    break;
                }
                case 5: {
                    //SP_ATTACHMENT_POINT
                    attachment = {};
                    let point = attachment;
                    point.rotation = input.readFloat();
                    point.x = input.readFloat();
                    point.y = input.readFloat();
                    if (nonessential) {
                        point.color = input.readColorHex();
                    }
                    break;
                }
                case 6: {
                    //SP_ATTACHMENT_CLIPPING
                    let endSlotIndex = input.readVarint(input, 1);
                    let vertexCount = input.readVarint(input, 1);
                    attachment = {};
                    attachment.vertexCount = vertexCount;
                    let clip = attachment;
                    input.readVertices(clip, vertexCount);

                    if (nonessential) {
                        clip.color = input.readColorHex();
                    }
                    clip.end = skeletonData.slots[endSlotIndex].name;
                    break;
                }
            }
            attachment.type = typeMode[type];
            if(!attachment.name){attachment.name = attachmentName}
            return attachment;
        }
    };
    BinaryInput.prototype.readSkin21 = function (skeletonData, nonessential) {
        let input = this;
        const slotCount = input.readVarint(1);
        if (slotCount === 0) {
            return null;
        }
        let skin = {};
        for (let i = 0; i < slotCount; ++i) {
            const slotIndex = input.readVarint(1);
            const nn = input.readVarint(1);
            let slot = {};
            for (let ii = 0; ii < nn; ++ii) {
                const name = input.readString();
                const attachment = readAttachment(
                    name,
                    skeletonData,
                    nonessential
                );
                if (attachment) {
                    slot[name] = attachment;
                }
                skin[skeletonData.slots[slotIndex].name] = slot;
            }
        }
        return skin;
        function readAttachment(attachmentName, skeletonData, nonessential) {
            const ATTACHMENT_TYPES = [
                "region",
                "boundingbox",
                "mesh",
                "linkedmesh",
                "path",
                "point",
                "clipping",
            ];
            const name = input.readString() || attachmentName;
            const type = input.readByte();
            if (type >= ATTACHMENT_TYPES.length) {
                console.warn(`Invalid  attachment type: ${type}`);
                return null;
            }
            const attachment = {
                name,
                type: ATTACHMENT_TYPES[type],
                path: type <= 3 ? input.readString() || name : undefined,
            };
            switch (type) {
                case 0: // REGION
                    Object.assign(attachment, {
                        x: input.readFloat(),
                        y: input.readFloat(),
                        scaleX: input.readFloat(),
                        scaleY: input.readFloat(),
                        rotation: input.readFloat(),
                        width: input.readFloat(),
                        height: input.readFloat(),
                        color: input.readColorHex(),
                    });
                    break;

                case 1: // BOUNDING_BOX
                    attachment.vertices = input.readFloatArray();
                    break;

                case 2: // MESH
                    Object.assign(attachment, {
                        uvs: input.readFloatArray(),
                        triangles: input.readShortArray(),
                        vertices: input.readFloatArray(),
                        color: input.readColorHex(),
                        hull: input.readVarint(true),
                        ...(nonessential && {
                            edges: input.readIntArray(),
                            width: input.readFloat(),
                            height: input.readFloat(),
                        }),
                    });
                    break;

                case 3: // SKINNED_MESH
                    attachment.uvs = input.readFloatArray();
                    attachment.triangles = input.readShortArray();
                    attachment.vertices = readSkinnedVertices(input);
                    attachment.color = input.readColorHex();
                    attachment.hull = input.readVarint(true);
                    if (nonessential) {
                        attachment.edges = input.readIntArray();
                        attachment.size = {
                            width: input.readFloat(),
                            height: input.readFloat(),
                        };
                    }
                    break;

                case 4: // PATH
                    Object.assign(attachment, {
                        closed: input.readBoolean(),
                        constantSpeed: input.readBoolean(),
                        vertices: input.readVertices(input.readVarint(true)),
                        lengths: input.readFloatArray(
                            Math.ceil(attachment.vertices.length / 3)
                        ),
                        ...(nonessential && { color: input.readColorHex() }),
                    });
                    break;

                case 6: // CLIPPING
                    const endSlotIndex = input.readVarint(true);
                    attachment.vertices = input.readVertices(
                        input.readVarint(true)
                    );
                    attachment.end = skeletonData.slots[endSlotIndex].name;
                    if (nonessential) attachment.color = input.readColorHex();
                    break;
            }

            return attachment;
        }
        function readSkinnedVertices(input) {
            const vertices = [];
            const vertexCount = input.readVarint(true);

            for (let i = 0; i < vertexCount; ) {
                const boneCount = Math.floor(input.readFloat());
                vertices[i++] = boneCount;

                for (let end = i + boneCount * 4; i < end; i += 4) {
                    vertices[i] = Math.floor(input.readFloat()); // boneIndex
                    vertices[i + 1] = input.readFloat(); // x
                    vertices[i + 2] = input.readFloat(); // y
                    vertices[i + 3] = input.readFloat(); // weight
                }
            }
            return vertices;
        }
    };
    BinaryInput.prototype.readVertices = function (attachment, vertexCount) {
        let input = this;
        const verticesLength = vertexCount * 2;
        const weights = [];
        if (!input.readBoolean()) {
            attachment.verticesCount = verticesLength;
            attachment.vertices = input.readFloatArray(verticesLength);
            attachment.bonesCount = 0;
            return;
        }

        for (let i = 0; i < vertexCount; ++i) {
            const boneCount = input.readVarint(1);
            weights.push(boneCount);
            for (let ii = 0; ii < boneCount; ++ii) {
                weights.push(input.readVarint(1)); // 骨骼索引
                weights.push(input.readFloat()); // 权重 x
                weights.push(input.readFloat()); // 权重 y
                weights.push(input.readFloat()); // 权重 z
            }
        }
        attachment.vertices = weights;
    };
    BinaryInput.prototype.readShortArray = function () {
        let n = this.readVarint(1);
        let array = [];
        for (i = 0; i < n; ++i) {
            array[i] = this.readByte() << 8;
            array[i] |= this.readByte();
        }
        return array;
    };
    return BinaryInput;
})();
SimpleSpine.skelToJson.spine36To38 = function (obj) {
    const skel = JSON.parse(JSON.stringify(obj));
    skel.skeleton.spine = "3.8.95";
    let skins = [];
    Object.keys(skel.skins).forEach((key) => {
        let data = {
            name: key,
            attachments: skel.skins[key],
        };
        //2.1版本
        let attachments = skel.skins[key];
        for (let key in attachments) {
            for (let name in attachments[key]) {
                let obj1 = attachments[key][name];
                if (obj1.type == "skinnedmesh") {
                    obj1.type = "mesh";
                }
            }
        }
        skins.push(data);
    });
    //2.1版本
    skel.bones.forEach((e) => {
        if (!e.transform) {
            e.transform = "normal";
        }
        if (e.inheritScale) {
            delete e.inheritScale;
        }
        if (e.inheritRotation) {
            delete e.inheritRotation;
        }
    });
    skel.skins = skins;
    handleAnimationsCurve(skel.animations); //循环遍历转换curve
    handleAnimationsPathName(skel.animations); //转换path名称
    setIkAndPathOrder(skel);

    function handleAnimationsCurve(obj, objName) {
        if (!isObject(obj)) {
            return;
        }
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                for (var i = 0; i < obj[key].length; i++) {
                    let obj1 = obj[key][i];
                    if (Array.isArray(obj1["curve"])) {
                        let curve = obj1["curve"];
                        delete obj1["curve"];
                        if (curve[0]) obj1["curve"] = curve[0];
                        if (curve[1]) obj1["c2"] = curve[1];
                        if (curve[2]) obj1["c3"] = curve[2];
                        if (curve[3]) obj1["c4"] = curve[3];
                    }
                }
                //2.1版本 暂时没办法比较完美处理反转+旋转问题
                if (key == "flipX" || key == "flipY") {
                    if (obj["scale"] && obj[key].length != 0) {
                        obj["scale"].forEach((e) => {
                            if (e.x) {
                                e.x = obj[key][0].x ? e.x * -1 : e.x;
                            }
                            if (e.y) {
                                e.y = obj[key][0].y ? e.y * -1 : e.y;
                            }
                        });
                    }
                    if (obj["rotate"] && obj[key].length != 0) {
                        let bones = skel.bones.find(
                            (item) => item.name === objName
                        );
                        if (bones && bones.rotation) {
                            obj["rotate"].forEach((e) => {
                                let na0 = -(e.angle + bones.rotation * 2) + 180;
                                //规范化角度
                                let na = na0;
                                if (na0 < -360) na = na0 + 360;
                                else if (na0 > 360) na = na0 - 360;
                                e.angle_old = e.angle;
                                e.angle = na;
                            });
                        }
                    }
                    delete obj[key];
                }
            } else {
                handleAnimationsCurve(obj[key], key);
            }
        }
    }
    function handleAnimationsPathName(obj) {
        if (!isObject(obj)) {
            return;
        }
        for (let AnimationsName in obj) {
            if (!isObject(obj[AnimationsName])) {
                break;
            }
            if (obj[AnimationsName]["paths"]) {
                let path = obj[AnimationsName]["paths"];
                delete obj[AnimationsName]["paths"];
                obj[AnimationsName]["path"] = path;
            }
        }
    }
    function setIkAndPathOrder(skel) {
        if (skel.ik && skel.ik.length != 0) {
            skel.ik.forEach((e, i) => {
                if (e.order == undefined) {
                    e.order = i;
                }
            });
        }
        if (skel.path && skel.path.length != 0) {
            skel.path.forEach((e, i) => {
                if (e.order == undefined) {
                    e.order = 2;
                }
            });
        }
    }
    function isObject(obj) {
        return obj !== null && typeof obj === "object";
    }
    return skel;
};
SimpleSpine.skelToJson.readSkeletonData36And37 = function (binary) {
    let skeletonData = {};
    var input = new this.BinaryInput(binary);
    let skeleton = {
        hash: input.readString(),
        spine: input.readString(),
        width: input.readFloat(),
        height: input.readFloat(),
    };
    let version = skeleton.spine.startsWith(3.7) ? 37 : 36

    var nonessential = input.readBoolean();
    if (nonessential) {
        skeleton.fps = input.readFloat();
        skeleton.images = input.readString();
        if(version == 37){
            input.readString();
        }
    }
    skeletonData.skeleton = skeleton;
    /* Bones. */
    bonesCount = input.readVarint(true);
    skeletonData.bones = [];
    for (var i = 0; i < bonesCount; i++) {
        let data = {
            name: input.readString(),
            parent: null,
        };
        const parentIndex = i === 0 ? null : input.readVarint(true);
        if (parentIndex != null) {
            data.parent = skeletonData.bones[parentIndex].name;
        }
        // 读取骨骼属性
        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearX = input.readFloat();
        data.shearY = input.readFloat();
        data.length = input.readFloat();

        let key = ["rotation", "x", "y", "shearX", "shearY", "length"];
        key.forEach((e) => {
            if (data[e] === 0) {
                delete data[e];
            }
        });
        let key2 = ["scaleX", "scaleY"];
        key2.forEach((e) => {
            if (data[e] === 1) {
                delete data[e];
            }
        });

        // 读取变换模式
        let transformMode = [
            "normal",
            "onlytranslation",
            "norotationorreflection",
            "noscale",
            "noscaleorreflection",
        ];
        data.transform = transformMode[input.readVarint(true)];

        if (nonessential) {
            data.color = input.readColorHex(); // 跳过骨骼颜色
        }
        skeletonData.bones.push(data);
    }

    /* Slots. */
    skeletonData.slots = [];
    slotsCount = input.readVarint(1);
    for (let i = 0; i < slotsCount; ++i) {
        const slotName = input.readString();
        const boneIndex = input.readVarint(1);
        const boneData = skeletonData.bones[boneIndex];

        let slotData = {
            name: slotName,
            bone: boneData.name,
        };

        let color = input.readColorHex();
        if (color != "ffffffff") {
            slotData.color = color;
        }
        let dark = input.readColorHex();
        if (dark != "ffffffff") {
            slotData.dark = dark;
        }
        // 读取附加名称和混合模式
        slotData.attachment = input.readString();
        slotData.blend = ["normal", "additive", "multiply", "screen"][
            input.readVarint(1)
        ];
        skeletonData.slots[i] = slotData;
    }

    /* IK constraints. */
    ikConstraintsCount = input.readVarint(1);
    skeletonData.ik = new Array(ikConstraintsCount);

    for (let i = 0; i < ikConstraintsCount; ++i) {
        // 创建 IK 约束数据
        let data = {
            name: input.readString(),
        };
        data.order = input.readVarint(1);
        bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);
        for (let ii = 0; ii < bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }
        data.target = skeletonData.bones[input.readVarint(1)].name;
        data.mix = input.readFloat();
        data.bendPositive = input.readByte() != 255;

        if (skeletonData.skeleton.spine.startsWith("3.7")) {
            data.compress = input.readBoolean();
            data.stretch = input.readBoolean();
            data.uniform = input.readBoolean();
        }
        skeletonData.ik[i] = data;
    }

    /* Transform constraints. */
    transformConstraintsCount = input.readVarint(1);
    skeletonData.transform = new Array(transformConstraintsCount);

    for (let i = 0; i < transformConstraintsCount; ++i) {
        // 创建变换约束数据
        const data = {
            name: input.readString(input),
        };
        data.order = input.readVarint(1);

        // 读取骨骼数量
        data.bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);

        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }

        // 读取目标骨骼
        data.target = skeletonData.bones[input.readVarint(1)].name;

        // 读取布尔值和浮点值
        data.local = input.readBoolean();
        data.relative = input.readBoolean();
        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        if (!data.x) delete data.x;
        if (!data.y) delete data.y;
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearY = input.readFloat();
        data.rotateMix = input.readFloat();
        data.translateMix = input.readFloat();
        data.scaleMix = input.readFloat();
        data.shearMix = input.readFloat();

        // 将数据存储在 skeletonData 中
        skeletonData.transform[i] = data;
    }

    /* Path constraints */
    pathConstraintsCount = input.readVarint(1);
    skeletonData.path = new Array(pathConstraintsCount);

    for (let i = 0; i < pathConstraintsCount; ++i) {
        const name = input.readString(input);
        // 创建路径约束数据
        const data = {
            name: name,
        };
        data.order = input.readVarint(1);
        data.bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);
        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }
        // 读取目标槽
        data.target = skeletonData.slots[input.readVarint(1)].name;
        // 读取位置模式、间距模式和旋转模式
        data.positionMode = ["fixed", "percent"][input.readVarint(1)];
        data.spacingMode = ["length", "fixed", "percent"][input.readVarint(1)];
        data.rotateMode = ["tangent", "chain", "chainScale"][
            input.readVarint(1)
        ];
        // 读取旋转偏移和位置
        data.rotation = input.readFloat(input);
        data.position = input.readFloat(input);

        // 读取间距
        data.spacing = input.readFloat(input);

        // 读取混合值
        data.rotateMix = input.readFloat(input);
        data.translateMix = input.readFloat(input);

        // 将数据存储在 skeletonData 中
        skeletonData.path[i] = data;
    }

    /* Default skin. */
    skeletonData.skins = {};

    let skins = [];

    skeletonData.skins.default = input.readSkin(skeletonData, nonessential);

    skins.push({
        name: "default",
        data: skeletonData.skins.default,
    });

    let skinsCount = input.readVarint(1);

    // 如果有默认皮肤，则增加皮肤数量
    if (skeletonData.defaultSkin) {
        skinsCount++;
    }

    if (skeletonData.defaultSkin) {
        skeletonData.skins.default = skeletonData.defaultSkin;
    }

    /* Skins. */
    for (let i = skeletonData.defaultSkin ? 1 : 0; i < skinsCount; ++i) {
        const skinName = input.readString(input);
        skeletonData.skins[skinName] = input.readSkin(
            skeletonData,
            nonessential
        );
        skins.push({
            name: skinName,
            data: skeletonData.skins[skinName],
        });
    }

    // Events.
    eventsCount = input.readVarint(1);
    skeletonData.events = {};
    for (let i = 0; i < eventsCount; ++i) {
        let name = input.readString();
        let eventData = {}; // 创建事件数据
        eventData.intValue = input.readVarint(0);
        eventData.floatValue = input.readFloat();
        eventData.stringValue = input.readString();
        if(version == 37){
            eventData.audioPath = input.readString();
            if (eventData.audioPath) {
                eventData.volume = input.readFloat();
                eventData.balance = input.readFloat();
            }            
        }
        skeletonData.events[name] = eventData; // 存储事件数据
    }

    // Animations.
    animationsCount = input.readVarint(1);
    skeletonData.animations = {};
    for (let i = 0; i < animationsCount; ++i) {
        let name = input.readString();
        let animation = input.readAnimation(skeletonData, skins, version);
        if (!animation) {
            throw new Error("读取动画列表时出现错误")(skeletonData);
        }
        skeletonData.animations[name] = animation; // 存储动画数据
    }
    return skeletonData;
};
SimpleSpine.skelToJson.readSkeletonData34And35 = function (binary) {
    let skeletonData = {};
    var input = new this.BinaryInput(binary);
    let skeleton = {
        hash: input.readString(),
        spine: input.readString(),
        width: input.readFloat(),
        height: input.readFloat(),
    };
    let isSpine35 = skeleton.spine.startsWith("3.5");

    var nonessential = input.readBoolean();
    if (nonessential) {
        if (isSpine35) {
            skeleton.fps = input.readFloat();
        }
        skeleton.images = input.readString();
    }

    skeletonData.skeleton = skeleton;
    /* Bones. */
    bonesCount = input.readVarint(true);
    skeletonData.bones = [];
    for (var i = 0; i < bonesCount; i++) {
        let data = {
            name: input.readString(),
            parent: null,
        };
        const parentIndex = i === 0 ? null : input.readVarint(true);
        if (parentIndex != null) {
            data.parent = skeletonData.bones[parentIndex].name;
        }
        // 读取骨骼属性
        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearX = input.readFloat();
        data.shearY = input.readFloat();
        data.length = input.readFloat();

        let key = ["rotation", "x", "y", "shearX", "shearY", "length"];
        key.forEach((e) => {
            if (data[e] === 0) {
                delete data[e];
            }
        });
        let key2 = ["scaleX", "scaleY"];
        key2.forEach((e) => {
            if (data[e] === 1) {
                delete data[e];
            }
        });

        if (isSpine35) {
            // 读取变换模式
            let transformMode = [
                "normal",
                "onlytranslation",
                "norotationorreflection",
                "noscale",
                "noscaleorreflection",
            ];
            data.transform = transformMode[input.readVarint(true)];
        } else {
            data.inheritRotation = input.readBoolean();
            data.inheritScale = input.readBoolean();
        }

        if (nonessential) {
            data.color = input.readColorHex(); // 跳过骨骼颜色
        }
        skeletonData.bones.push(data);
    }

    /* Slots. */
    skeletonData.slots = [];
    slotsCount = input.readVarint(1);
    for (let i = 0; i < slotsCount; ++i) {
        const slotName = input.readString();
        const boneIndex = input.readVarint(1);
        const boneData = skeletonData.bones[boneIndex];

        let slotData = {
            name: slotName,
            bone: boneData.name,
        };

        let color = input.readColorHex();
        if (color != "ffffffff") {
            slotData.color = color;
        }
        // let dark = input.readColorHex()
        // if(dark != "ffffffff"){
        //     slotData.dark = dark
        // }
        // 读取附加名称和混合模式
        slotData.attachment = input.readString();
        slotData.blend = ["normal", "additive", "multiply", "screen"][
            input.readVarint(1)
        ];
        skeletonData.slots[i] = slotData;
    }

    /* IK constraints. */
    ikConstraintsCount = input.readVarint(1);
    skeletonData.ik = new Array(ikConstraintsCount);

    for (let i = 0; i < ikConstraintsCount; ++i) {
        // 创建 IK 约束数据
        let data = {
            name: input.readString(),
        };
        if (isSpine35) {
            data.order = input.readVarint(1);
        }
        bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);
        for (let ii = 0; ii < bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }
        data.target = skeletonData.bones[input.readVarint(1)].name;
        data.mix = input.readFloat();
        data.bendPositive = input.readByte() != 255;
        skeletonData.ik[i] = data;
    }

    /* Transform constraints. */
    transformConstraintsCount = input.readVarint(1);
    skeletonData.transform = new Array(transformConstraintsCount);

    for (let i = 0; i < transformConstraintsCount; ++i) {
        // 创建变换约束数据
        const data = {
            name: input.readString(input),
        };
        if (isSpine35) {
            data.order = input.readVarint(1);
        }

        // 读取骨骼数量
        data.bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);

        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }

        // 读取目标骨骼
        data.target = skeletonData.bones[input.readVarint(1)].name;

        data.rotation = input.readFloat();
        data.x = input.readFloat();
        data.y = input.readFloat();
        if (!data.x) delete data.x;
        if (!data.y) delete data.y;
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.shearY = input.readFloat();
        data.rotateMix = input.readFloat();
        data.translateMix = input.readFloat();
        data.scaleMix = input.readFloat();
        data.shearMix = input.readFloat();

        // 将数据存储在 skeletonData 中
        skeletonData.transform[i] = data;
    }

    /* Path constraints */
    pathConstraintsCount = input.readVarint(1);
    skeletonData.path = new Array(pathConstraintsCount);

    for (let i = 0; i < pathConstraintsCount; ++i) {
        const name = input.readString(input);
        // 创建路径约束数据
        const data = {
            name: name,
        };
        if (isSpine35) {
            data.order = input.readVarint(1);
        }
        data.bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);
        for (let ii = 0; ii < data.bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }
        // 读取目标槽
        data.target = skeletonData.slots[input.readVarint(1)].name;
        // 读取位置模式、间距模式和旋转模式
        data.positionMode = ["fixed", "percent"][input.readVarint(1)];
        data.spacingMode = ["length", "fixed", "percent"][input.readVarint(1)];
        data.rotateMode = ["tangent", "chain", "chainScale"][
            input.readVarint(1)
        ];
        // 读取旋转偏移和位置
        data.rotation = input.readFloat(input);
        data.position = input.readFloat(input);

        // 读取间距
        data.spacing = input.readFloat(input);

        // 读取混合值
        data.rotateMix = input.readFloat(input);
        data.translateMix = input.readFloat(input);

        // 将数据存储在 skeletonData 中
        skeletonData.path[i] = data;

        Object.keys(data).forEach((e) => {
            if (data[e] == 0) {
                delete data[e];
            }
        });
    }

    /* Default skin. */
    skeletonData.skins = {};

    let skins = [];

    skeletonData.skins.default = input.readSkin(skeletonData, nonessential);

    skins.push({
        name: "default",
        data: skeletonData.skins.default,
    });

    let skinsCount = input.readVarint(1);

    // 如果有默认皮肤，则增加皮肤数量
    if (skeletonData.defaultSkin) {
        skinsCount++;
    }

    if (skeletonData.defaultSkin) {
        skeletonData.skins.default = skeletonData.defaultSkin;
    }

    /* Skins. */
    for (let i = skeletonData.defaultSkin ? 1 : 0; i < skinsCount; ++i) {
        const skinName = input.readString(input);
        skeletonData.skins[skinName] = input.readSkin(
            skeletonData,
            nonessential
        );
        skins.push({
            name: skinName,
            data: skeletonData.skins[skinName],
        });
    }

    // Events.
    eventsCount = input.readVarint(1);
    skeletonData.events = {};
    for (let i = 0; i < eventsCount; ++i) {
        let name = input.readString();
        let eventData = {}; // 创建事件数据
        eventData.intValue = input.readVarint(0);
        eventData.floatValue = input.readFloat();
        eventData.stringValue = input.readString();
        skeletonData.events[name] = eventData; // 存储事件数据
    }

    // Animations.
    animationsCount = input.readVarint(1);
    skeletonData.animations = {};
    for (let i = 0; i < animationsCount; ++i) {
        let name = input.readString();
        let animation = input.readAnimation(skeletonData, skins);
        if (!animation) {
            throw new Error("读取动画列表时出现错误");
        }
        skeletonData.animations[name] = animation; // 存储动画数据
    }
    return skeletonData;
};
SimpleSpine.skelToJson.readSkeletonData21 = function (binary) {
    let skeletonData = {};
    var input = new this.BinaryInput(binary);
    let skeleton = {
        hash: input.readString(),
        spine: input.readString(),
        width: input.readFloat(),
        height: input.readFloat(),
    };

    var nonessential = input.readBoolean();
    if (nonessential) {
        skeleton.images = input.readString();
    }

    skeletonData.skeleton = skeleton;
    /* Bones. */
    bonesCount = input.readVarint(true);
    skeletonData.bones = [];
    for (var i = 0; i < bonesCount; i++) {
        let data = {
            name: input.readString(),
        };
        const parentIndex = input.readVarint(true) - 1;
        if (parentIndex != -1) {
            data.parent = skeletonData.bones[parentIndex].name;
        }
        // 读取骨骼属性
        data.x = input.readFloat();
        data.y = input.readFloat();
        data.scaleX = input.readFloat();
        data.scaleY = input.readFloat();
        data.rotation = input.readFloat();
        data.length = input.readFloat();
        data.flipX = input.readBoolean();
        data.flipY = input.readBoolean();
        data.inheritScale = input.readBoolean();
        data.inheritRotation = input.readBoolean();

        let key = ["rotation", "x", "y", "length", "flipX", "flipY"];
        key.forEach((e) => {
            if (data[e] == 0) {
                delete data[e];
            }
        });
        let key2 = ["scaleX", "scaleY"];
        key2.forEach((e) => {
            if (data[e] == 1) {
                delete data[e];
            }
        });

        if (nonessential) {
            data.color = input.readColorHex(); // 跳过骨骼颜色
        }
        skeletonData.bones.push(data);
    }

    /* IK constraints. */
    ikConstraintsCount = input.readVarint(1);
    skeletonData.ik = new Array(ikConstraintsCount);

    for (let i = 0; i < ikConstraintsCount; ++i) {
        // 创建 IK 约束数据
        let data = {
            name: input.readString(),
        };
        bonesCount = input.readVarint(1);
        data.bones = new Array(data.bonesCount);
        for (let ii = 0; ii < bonesCount; ++ii) {
            data.bones[ii] = skeletonData.bones[input.readVarint(1)].name;
        }
        data.target = skeletonData.bones[input.readVarint(1)].name;
        data.mix = input.readFloat();
        data.bendPositive = input.readByte() != 255;
        skeletonData.ik[i] = data;
    }

    /* Slots. */
    skeletonData.slots = [];
    slotsCount = input.readVarint(1);
    for (let i = 0; i < slotsCount; ++i) {
        const slotName = input.readString();
        const boneIndex = input.readVarint(1);
        const boneData = skeletonData.bones[boneIndex];

        let slotData = {
            name: slotName,
            bone: boneData.name,
        };

        let color = input.readColorHex();
        if (color != "ffffffff") {
            slotData.color = color;
        }
        slotData.attachment = input.readString();
        slotData.blend = ["normal", "additive", "multiply", "screen"][
            input.readVarint(1)
        ];
        skeletonData.slots[i] = slotData;
    }

    /* Default skin. */
    skeletonData.skins = {};

    let skins = [];

    skeletonData.skins.default = input.readSkin21(skeletonData, nonessential);

    skins.push({
        name: "default",
        data: skeletonData.skins.default,
    });

    let skinsCount = input.readVarint(1);

    if (skeletonData.defaultSkin) {
        skinsCount++;
    }

    if (skeletonData.defaultSkin) {
        skeletonData.skins.default = skeletonData.defaultSkin;
    }

    /* Skins. */
    for (let i = skeletonData.defaultSkin ? 1 : 0; i < skinsCount; ++i) {
        const skinName = input.readString(input);
        skeletonData.skins[skinName] = input.readSkin21(
            skeletonData,
            nonessential
        );
        skins.push({
            name: skinName,
            data: skeletonData.skins[skinName],
        });
    }

    // Events.
    eventsCount = input.readVarint(1);
    skeletonData.events = {};
    for (let i = 0; i < eventsCount; ++i) {
        let name = input.readString();
        let eventData = {}; // 创建事件数据
        eventData.intValue = input.readVarint(0);
        eventData.floatValue = input.readFloat();
        eventData.stringValue = input.readString();
        skeletonData.events[name] = eventData; // 存储事件数据
    }

    // Animations.
    animationsCount = input.readVarint(1);
    skeletonData.animations = {};
    for (let i = 0; i < animationsCount; ++i) {
        let name = input.readString();
        let animation = input.readAnimation21(skeletonData, skins);
        if (!animation) {
            throw new Error("读取动画列表时出现错误")(skeletonData);
        }
        skeletonData.animations[name] = animation; // 存储动画数据
    }
    return skeletonData;
};
