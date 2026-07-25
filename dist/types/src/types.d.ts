export interface VersionConfig {
    target: string;
    handler: 'readSkeletonData21' | 'readSkeletonData34And35' | 'readSkeletonData36And37' | null;
}
export interface SkeletonInfo {
    hash: string;
    spine: string;
    width: number;
    height: number;
    fps?: number;
    images?: string;
    audio?: string;
}
export interface BoneData {
    name: string;
    parent: string | null;
    rotation?: number;
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    shearX?: number;
    shearY?: number;
    length?: number;
    transform?: string;
    inheritRotation?: boolean;
    inheritScale?: boolean;
    color?: string;
}
export interface SlotData {
    name: string;
    bone: string;
    color?: string;
    dark?: string;
    attachment?: string;
    blend?: 'normal' | 'additive' | 'multiply' | 'screen';
}
export interface IkConstraintData {
    name: string;
    order?: number;
    bones: string[];
    target: string;
    mix: number;
    bendPositive: boolean;
    compress?: boolean;
    stretch?: boolean;
    uniform?: boolean;
}
export interface TransformConstraintData {
    name: string;
    order?: number;
    bones: string[];
    target: string;
    local?: boolean;
    relative?: boolean;
    rotation: number;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    shearY: number;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
}
export interface PathConstraintData {
    name: string;
    order?: number;
    bones: string[];
    target: string;
    positionMode: 'fixed' | 'percent';
    spacingMode: 'length' | 'fixed' | 'percent';
    rotateMode: 'tangent' | 'chain' | 'chainScale';
    rotation: number;
    position: number;
    spacing: number;
    rotateMix: number;
    translateMix: number;
}
export interface AttachmentData {
    name?: string;
    type?: 'region' | 'boundingbox' | 'mesh' | 'linkedmesh' | 'path' | 'point' | 'clipping';
    path?: string;
    rotation?: number;
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    width?: number;
    height?: number;
    color?: string;
    vertexCount?: number;
    vertices?: number[];
    verticesCount?: number;
    bonesCount?: number;
    uvs?: number[];
    triangles?: number[];
    hull?: number;
    edges?: number[];
    skin?: string;
    parent?: string;
    inheritDeform?: boolean;
    closed?: boolean;
    constantSpeed?: boolean;
    lengths?: number[];
    end?: string;
}
export interface SkinData {
    [slotName: string]: {
        [attachmentName: string]: AttachmentData;
    };
}
export interface EventData {
    intValue?: number;
    floatValue?: number;
    stringValue?: string;
    audioPath?: string;
    volume?: number;
    balance?: number;
}
export interface SpineSkeletonData {
    skeleton?: SkeletonInfo;
    bones?: BoneData[];
    slots?: SlotData[];
    ik?: IkConstraintData[];
    transform?: TransformConstraintData[];
    path?: PathConstraintData[];
    skins?: {
        [skinName: string]: SkinData;
    } | SkinData[];
    events?: {
        [eventName: string]: EventData;
    };
    animations?: {
        [animationName: string]: any;
    };
    defaultSkin?: SkinData;
}
export interface TextureInfo {
    name: string;
    width: number;
    height: number;
}
export interface TextureData {
    name: string;
    src?: string;
    data?: Uint8Array | ArrayBuffer;
    width?: number;
    height?: number;
    texture?: any;
}
export interface MemorySpineSource {
    skeletonData: ArrayBuffer | string | object;
    atlasData: string;
    textureData?: TextureData[];
    texturePath?: string;
    version?: string;
    path?: string[];
    atlasPath?: string;
}
