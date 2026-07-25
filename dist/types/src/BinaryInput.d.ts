/**
 * Spine 二进制骨骼文件 (.skel) 数据流读取辅助类
 */
export declare class BinaryInput {
    index: number;
    buffer: DataView;
    strings: string[];
    /**
     * @param buffer - 二进制文件 Buffer 数据
     */
    constructor(buffer: ArrayBuffer);
    /**
     * 读取 1 字节无符号整数
     */
    readByte(): number;
    /**
     * 读取 1 字节有符号整数
     */
    readSByte(): number;
    /**
     * 读取 2 字节有符号短整数 (Big-Endian)
     */
    readShort(): number;
    /**
     * 读取 4 字节有符号整数 (Big-Endian)
     */
    readInt32(): number;
    /**
     * 读取可变长度整数 (Varint)
     * @param optimizePositive - 是否优化正数
     */
    readVarint(optimizePositive: boolean): number;
    /**
     * 读取 RGBA 颜色对象
     */
    readColor(): {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    /**
     * 读取十六进制颜色字符串 (例如 "ffffffff")
     */
    readColorHex(): string;
    /**
     * 读取引用的字符串
     */
    readStringRef(): string | null;
    /**
     * 读取 UTF-8 编码的字符串
     */
    readString(): string | null;
    /**
     * 读取 4 字节单精度浮点数 (Big-Endian)
     */
    readFloat(): number;
    /**
     * 读取 Spine 2.1 版本特定的 4 字节单精度浮点数
     */
    readFloat21(): number;
    /**
     * 读取布尔值
     */
    readBoolean(): boolean;
    /**
     * 读取可变长度整数数组
     */
    readIntArray(): number[];
    /**
     * 读取关键帧贝塞尔曲线参数
     * @returns - 'stepped' 或 [cx1, cy1, cx2, cy2]
     */
    readCurve(): 'stepped' | number[] | undefined;
    /**
     * 读取单精度浮点数数组
     * @param n - 数组长度，如未提供则自数据流中读取长度
     */
    readFloatArray(n?: number): number[];
    /**
     * 读取短整数数组 (2字节 Big-Endian)
     */
    readShortArray(): number[];
}
