import { readSkeletonData21 } from './SkelToJson21';
import { readSkeletonData34And35 } from './SkelToJson34And35';
import { readSkeletonData36And37 } from './SkelToJson36And37';
import { SpineSkeletonData } from './types';

export { readSkeletonData21, readSkeletonData34And35, readSkeletonData36And37 };

/**
 * 将骨架数据从遗留版本格式规范化升级为 v3.8 标准 JSON 结构
 * @param obj - 原始遗留版本 JSON 结构对象
 * @returns 转换后的 3.8 标准对象
 */
export function normalizeTo38(obj: SpineSkeletonData): SpineSkeletonData {
    // 1. 深拷贝并移除所有 undefined 的属性，保证和本地保存再打开 JSON 的表现一致
    const skel = JSON.parse(JSON.stringify(obj)) as SpineSkeletonData;

    skel.skeleton = skel.skeleton || { hash: '', spine: '', width: 0, height: 0 };
    skel.skeleton.spine = '3.8.95';

    // 2. 处理 Skins (从对象格式转为数组格式)
    if (skel.skins && !Array.isArray(skel.skins)) {
        skel.skins = Object.entries(skel.skins).map(([name, attachments]) => {
            // 处理 skinnedmesh 转换
            for (const slotName in attachments) {
                for (const attachmentName in attachments[slotName]) {
                    const attachment = attachments[slotName][attachmentName];
                    if (attachment && attachment.type === 'skinnedmesh' as any) {
                        attachment.type = 'mesh';
                    }
                }
            }
            return { name, attachments };
        }) as any;
    }

    // 3. 处理 Bones
    if (skel.bones) {
        skel.bones.forEach((bone) => {
            bone.transform = bone.transform || 'normal';
            delete bone.inheritScale;
            delete bone.inheritRotation;
        });
    }

    // 4. 辅助函数：角度规范化
    const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

    // 5. 递归处理动画 Curve 和 Flip
    const processAnimations = (node: any, nodeName?: string) => {
        if (!node || typeof node !== 'object') return;

        for (const [key, value] of Object.entries(node)) {
            if (Array.isArray(value)) {
                // 处理 Curve 数组转 c2, c3, c4
                value.forEach((frame) => {
                    if (Array.isArray(frame.curve)) {
                        const [c1, c2, c3, c4] = frame.curve;
                        frame.curve = c1 ?? 0;
                        if (c2 !== undefined) frame.c2 = c2;
                        if (c3 !== undefined) frame.c3 = c3;
                        if (c4 !== undefined) frame.c4 = c4;
                    }
                });

                // 处理 3.8 不再支持的 flipX / flipY
                if (key === 'flipX' || key === 'flipY') {
                    if (value.length > 0) {
                        const isFlipX = key === 'flipX';
                        // 处理缩放
                        if (node.scale) {
                            node.scale.forEach((s: any) => {
                                if (isFlipX) s.x = (s.x || 1) * -1;
                                else s.y = (s.y || 1) * -1;
                            });
                        }
                        // 处理旋转
                        if (node.rotate) {
                            const boneBase = skel.bones ? skel.bones.find((b) => b.name === nodeName) : null;
                            const baseRotation = boneBase?.rotation || 0;
                            node.rotate.forEach((r: any) => {
                                r.angle_old = r.angle;
                                // 逻辑：镜像后的角度偏移计算
                                const newAngle = -(r.angle + baseRotation * 2) + 180;
                                r.angle = normalizeAngle(newAngle);
                            });
                        }
                    }
                    delete node[key];
                }
            } else {
                processAnimations(value, key);
            }
        }
    };

    // 执行动画 and 路径名称转换
    if (skel.animations) {
        processAnimations(skel.animations);
        // 转换 paths 关键字为 path
        Object.values(skel.animations).forEach((anim: any) => {
            if (anim.paths) {
                anim.path = anim.paths;
                delete anim.paths;
            }
        });
    }

    // 6. 处理 IK 和 Path 排序
    const setOrder = (items: any[] | undefined, defaultOrder: any = 0) => {
        if (Array.isArray(items)) {
            items.forEach((item, i) => {
                if (item.order === undefined) item.order = defaultOrder === 'index' ? i : defaultOrder;
            });
        }
    };

    setOrder(skel.ik, 'index');
    setOrder(skel.path as any[], 2);

    return skel;
}

/**
 * @deprecated 请使用 normalizeTo38 代替
 */
export function spine36To38(obj: SpineSkeletonData): SpineSkeletonData {
    return normalizeTo38(obj);
}
