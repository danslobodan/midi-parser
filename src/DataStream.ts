interface IDataStream {
    movePointer: (_bytes: number) => number;
    readInt: (_bytes: number) => number;
    readStr: (_bytes: number) => string;
    readIntVariableLengthValue: () => number;
}

class DataStream implements IDataStream {
    private data: DataView;
    private pointer: number = 0;

    constructor(data: DataView) {
        this.data = data;
    }

    public movePointer(bytes: number) {
        // move the pointer negative and positive direction
        this.pointer += bytes;
        return this.pointer;
    }

    public readInt(bytes: number) {
        // get integer from next _bytes group (big-endian)
        bytes = Math.min(bytes, this.data.byteLength - this.pointer);
        if (bytes < 1) return -1; // EOF

        let value = 0;
        if (bytes > 1) {
            for (let i = 1; i <= bytes - 1; i++) {
                value +=
                    this.data.getUint8(this.pointer) * Math.pow(256, bytes - i);
                this.pointer++;
            }
        }

        value += this.data.getUint8(this.pointer);
        this.pointer++;
        return value;
    }

    public readStr(bytes: number) {
        // read as ASCII chars, the followoing _bytes
        let text = "";
        for (let char = 1; char <= bytes; char++)
            text += String.fromCharCode(this.readInt(1));
        return text;
    }

    public readIntVariableLengthValue() {
        if (this.pointer >= this.data.byteLength) {
            return -1; // EOF
        }

        const bytes = [];

        const CONTINUATION_BIT = 0b10000000;
        while (this.data.getUint8(this.pointer) & CONTINUATION_BIT) {
            const valueByte = this.readInt(1);
            const value7bit = valueByte & ~CONTINUATION_BIT;
            bytes.push(value7bit);

            if (!(valueByte & CONTINUATION_BIT)) break;
        }
        const lastByte = this.readInt(1);
        bytes.push(lastByte);

        const bytesReversed = bytes.reverse();

        let value = 0;
        for (let i = 0; i < bytesReversed.length; i++) {
            value += bytesReversed[i] << (7 * i);
        }

        console.log("value", value);
        return value;
    }
}

export { DataStream };
export type { IDataStream };
