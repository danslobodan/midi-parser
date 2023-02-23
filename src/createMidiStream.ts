import { IMidiStream } from "./domain/IMidiStream";

export const END_OF_FILE = -1;

export const createStream = (data: DataView): IMidiStream => {
    let pointer: number = 0;

    const movePointer = (bytes: number) => {
        pointer += bytes;
    };

    const readByte = (): number => {
        return data.getUint8(pointer++);
    };

    const readInt = (bytes: number) => {
        bytes = Math.min(bytes, data.byteLength - pointer);

        if (bytes < 1) return END_OF_FILE;

        let value = 0;
        for (let i = 1; i <= bytes; i++) {
            const byteValue = readByte();
            const shift = bytes - i;
            const shiftedValue = byteValue << (shift * 8);
            value += shiftedValue;
        }

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
            return END_OF_FILE;
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
