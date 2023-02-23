export interface IDataStream {
    movePointer: (_bytes: number) => void;
    readInt: (_bytes: number) => number;
    readStr: (_bytes: number) => string;
    readIntVariableLengthValue: () => number;
}

export const dataStream = (data: DataView): IDataStream => {
    let pointer: number = 0;

    const movePointer = (bytes: number) => {
        // move the pointer negative and positive direction
        pointer += bytes;
    };

    const readInt = (bytes: number) => {
        // get integer from next _bytes group (big-endian)
        bytes = Math.min(bytes, data.byteLength - pointer);
        if (bytes < 1) return -1; // EOF

        let value = 0;
        if (bytes > 1) {
            for (let i = 1; i <= bytes - 1; i++) {
                value += data.getUint8(pointer) * Math.pow(256, bytes - i);
                pointer++;
            }
        }

        value += data.getUint8(pointer);
        pointer++;
        return value;
    };

    const readStr = (bytes: number) => {
        // read as ASCII chars, the followoing _bytes
        let text = "";
        for (let char = 1; char <= bytes; char++)
            text += String.fromCharCode(readInt(1));
        return text;
    };

    const readIntVariableLengthValue = () => {
        if (pointer >= data.byteLength) {
            return -1; // EOF
        }

        const bytes = [];

        const CONTINUATION_BIT = 0b10000000;
        while (true) {
            const valueByte = readInt(1);
            const value7bit = valueByte & ~CONTINUATION_BIT;
            bytes.push(value7bit);

            if (!(valueByte & CONTINUATION_BIT)) break;
        }

        bytes.reverse();
        let value = 0;
        for (let i = 0; i < bytes.length; i++) {
            value += bytes[i] << (i * 7);
        }

        return value;
    };

    return {
        movePointer,
        readInt,
        readStr,
        readIntVariableLengthValue,
    };
};
