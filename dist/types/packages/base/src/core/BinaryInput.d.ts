/**
 * @public
 */
export declare class BinaryInput {
    strings: string[];
    private index;
    private buffer;
    constructor(data: Uint8Array, strings?: string[], index?: number, buffer?: DataView);
    readByte(): number;
    readUnsignedByte(): number;
    readShort(): number;
    readInt32(): number;
    readInt(optimizePositive: boolean): number;
    readStringRef(): string | null;
    readString(): string | null;
    readFloat(): number;
    readBoolean(): boolean;
}
