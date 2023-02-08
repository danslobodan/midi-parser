interface IFileBuffer {
    movePointer: (_bytes: number) => number;
    readInt: (_bytes: number) => number;
    readStr: (_bytes: number) => string;
    readIntVariableLengthValue: () => number;
}

class FileBuffer implements IFileBuffer {
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
        } else if (this.data.getUint8(this.pointer) < 128) {
            // ...value in a single byte
            return this.readInt(1);
        } else {
            // ...value in multiple bytes

            let value = 0;
            let FirstBytes = [];
            while (this.data.getUint8(this.pointer) >= 128) {
                FirstBytes.push(this.readInt(1) - 128);
            }

            const lastByte = this.readInt(1);
            for (let dt = 1; dt <= FirstBytes.length; dt++) {
                value += FirstBytes[FirstBytes.length - dt] * Math.pow(128, dt);
            }
            value += lastByte;
            return value;
        }
    }
}

export { FileBuffer };
export type { IFileBuffer };
