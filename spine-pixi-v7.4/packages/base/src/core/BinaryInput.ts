/**
 * @public
 */
export class BinaryInput {
    constructor(data: Uint8Array, public strings = new Array<string>(), private index: number = 0, private buffer = new DataView(data.buffer)) {}

    readByte(): number {
        return this.buffer.getInt8(this.index++);
    }

    readUnsignedByte(): number {
        return this.buffer.getUint8(this.index++);
    }

    readShort(): number {
        const value = this.buffer.getInt16(this.index);

        this.index += 2;

        return value;
    }

    readInt32(): number {
        const value = this.buffer.getInt32(this.index);

        this.index += 4;

        return value;
    }

    readInt(optimizePositive: boolean) {
        let b = this.readByte();
        let result = b & 0x7f;

        if ((b & 0x80) != 0) {
            b = this.readByte();
            result |= (b & 0x7f) << 7;
            if ((b & 0x80) != 0) {
                b = this.readByte();
                result |= (b & 0x7f) << 14;
                if ((b & 0x80) != 0) {
                    b = this.readByte();
                    result |= (b & 0x7f) << 21;
                    if ((b & 0x80) != 0) {
                        b = this.readByte();
                        result |= (b & 0x7f) << 28;
                    }
                }
            }
        }

        return optimizePositive ? result : (result >>> 1) ^ -(result & 1);
    }

    readStringRef(): string | null {
        const index = this.readInt(true);

        return index == 0 ? null : this.strings[index - 1];
    }

    readString(): string | null {
        let byteCount = this.readInt(true);

        switch (byteCount) {
            case 0:
                return null;
            case 1:
                return '';
        }
        byteCount--;
        let chars = '';

        for (let i = 0; i < byteCount; ) {
            const b = this.readUnsignedByte();

            switch (b >> 4) {
                case 12:
                case 13:
                    chars += String.fromCharCode(((b & 0x1f) << 6) | (this.readByte() & 0x3f));
                    i += 2;
                    break;
                case 14:
                    chars += String.fromCharCode(((b & 0x0f) << 12) | ((this.readByte() & 0x3f) << 6) | (this.readByte() & 0x3f));
                    i += 3;
                    break;
                default:
                    chars += String.fromCharCode(b);
                    i++;
            }
        }

        return chars;
    }

    readFloat(): number {
        const value = this.buffer.getFloat32(this.index);

        this.index += 4;

        return value;
    }

    readBoolean(): boolean {
        return this.readByte() != 0;
    }
}
