/**
 * Spine 二进制骨骼文件 (.skel) 数据流读取辅助类
 */
export class BinaryInput {
    /**
     * @param {ArrayBuffer} buffer - 二进制文件 Buffer 数据
     */
    constructor(buffer) {
        this.index = 0
        this.buffer = new DataView(buffer)
        this.strings = []
    }

    /**
     * 读取 1 字节无符号整数
     * @returns {number}
     */
    readByte() {
        return this.buffer.getUint8(this.index++)
    }

    /**
     * 读取 1 字节有符号整数
     * @returns {number}
     */
    readSByte() {
        return this.readByte()
    }

    /**
     * 读取 2 字节有符号短整数 (Big-Endian)
     * @returns {number}
     */
    readShort() {
        const value = this.buffer.getInt16(this.index, false) // 默认是 Big-Endian
        this.index += 2
        return value
    }

    /**
     * 读取 4 字节有符号整数 (Big-Endian)
     * @returns {number}
     */
    readInt32() {
        const value = this.buffer.getInt32(this.index, false)
        this.index += 4
        return value
    }

    /**
     * 读取可变长度整数 (Varint)
     * @param {boolean} optimizePositive - 是否优化正数
     * @returns {number}
     */
    readVarint(optimizePositive) {
        let result = 0
        let shift = 0
        let b

        do {
            b = this.readByte()
            result |= (b & 0x7f) << shift
            shift += 7
        } while ((b & 0x80) !== 0 && shift < 35)

        return optimizePositive ? result : (result >>> 1) ^ -(result & 1)
    }

    /**
     * 读取 RGBA 颜色对象
     * @returns {{r: number, g: number, b: number, a: number}}
     */
    readColor() {
        return {
            r: this.readByte(),
            g: this.readByte(),
            b: this.readByte(),
            a: this.readByte(),
        }
    }

    /**
     * 读取十六进制颜色字符串 (例如 "ffffffff")
     * @returns {string}
     */
    readColorHex() {
        const color = this.readColor()
        const hex = (val) => {
            const str = val.toString(16)
            return str.length === 2 ? str : '0' + str
        }
        return hex(color.r) + hex(color.g) + hex(color.b) + hex(color.a)
    }

    /**
     * 读取引用的字符串
     * @returns {string|null}
     */
    readStringRef() {
        const index = this.readVarint(true)
        return index === 0 ? null : this.strings[index - 1]
    }

    /**
     * 读取 UTF-8 编码的字符串
     * @returns {string|null}
     */
    readString() {
        let byteCount = this.readVarint(true)
        switch (byteCount) {
            case 0:
                return null
            case 1:
                return ''
        }
        byteCount--
        let chars = ''
        for (let i = 0; i < byteCount; ) {
            const b = this.readByte()
            switch (b >> 4) {
                case 12:
                case 13:
                    chars += String.fromCharCode(((b & 0x1f) << 6) | (this.readByte() & 0x3f))
                    i += 2
                    break
                case 14:
                    chars += String.fromCharCode(
                        ((b & 0x0f) << 12) | ((this.readByte() & 0x3f) << 6) | (this.readByte() & 0x3f),
                    )
                    i += 3
                    break
                default:
                    chars += String.fromCharCode(b)
                    i++
            }
        }
        return chars
    }

    /**
     * 读取 4 字节单精度浮点数 (Big-Endian)
     * @returns {number}
     */
    readFloat() {
        const value = this.buffer.getFloat32(this.index, false)
        this.index += 4
        return value
    }

    /**
     * 读取 Spine 2.1 版本特定的 4 字节单精度浮点数
     * @returns {number}
     */
    readFloat21() {
        return (this.readByte() << 24) + (this.readByte() << 16) + (this.readByte() << 8) + (this.readByte() << 0)
    }

    /**
     * 读取布尔值
     * @returns {boolean}
     */
    readBoolean() {
        return this.readByte() !== 0
    }

    /**
     * 读取可变长度整数数组
     * @returns {number[]}
     */
    readIntArray() {
        const n = this.readVarint(true)
        const array = new Array(n)
        for (let i = 0; i < n; i++) {
            array[i] = this.readVarint(true)
        }
        return array
    }

    /**
     * 读取关键帧贝塞尔曲线参数
     * @returns {string|number[]} - 'stepped' 或 [cx1, cy1, cx2, cy2]
     */
    readCurve() {
        switch (this.readByte()) {
            case 1: // CURVE_STEPPED
                return 'stepped'
            case 2: // CURVE_BEZIER
                const cx1 = this.readFloat()
                const cy1 = this.readFloat()
                const cx2 = this.readFloat()
                const cy2 = this.readFloat()
                return [cx1, cy1, cx2, cy2]
            default:
                return undefined
        }
    }

    /**
     * 读取单精度浮点数数组
     * @param {number} [n] - 数组长度，如未提供则自数据流中读取长度
     * @returns {number[]}
     */
    readFloatArray(n) {
        const length = n !== undefined ? n : this.readVarint(true)
        const array = new Array(length)
        for (let i = 0; i < length; i++) {
            array[i] = this.readFloat()
        }
        return array
    }

    /**
     * 读取短整数数组 (2字节 Big-Endian)
     * @returns {number[]}
     */
    readShortArray() {
        const n = this.readVarint(true)
        const array = new Array(n)
        for (let i = 0; i < n; ++i) {
            let val = this.readByte() << 8
            val |= this.readByte()
            array[i] = val
        }
        return array
    }
}
