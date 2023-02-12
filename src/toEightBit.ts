const numberTo8bitArray = (num: number): number[] => {
    const binaryString7bit = num.toString(2);

    const bytes = Math.ceil(binaryString7bit.length / 7);

    let binaryString8bit = "";
    for (let i = bytes - 1; i >= 0; i--) {
        let start = 0;
        let end = 0;

        if (i === 0) {
            end =
                binaryString7bit.length % 7 === 0
                    ? 7
                    : binaryString7bit.length % 7;
        } else {
            start = binaryString7bit.length - (bytes - i) * 7;
            end = binaryString7bit.length - (bytes - 1 - i);
        }

        const byte7bit = binaryString7bit.substring(start, end);

        const byte8bit =
            i === bytes - 1
                ? byte7bit.padStart(8, "0")
                : byte7bit.padStart(7, "0").padStart(8, "1");

        binaryString8bit = `${byte8bit}${binaryString8bit}`;
    }

    const num8bit = parseInt(binaryString8bit, 2);

    return numberTo8bitArrayFixedSize(num8bit, bytes);
};

const numberTo8bitArrayFixedSize = (num: number, size: number): number[] => {
    let shifter = num;
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
        const last8 = shifter & 0b11111111;
        shifter = shifter >> 8;
        arr.push(last8);
    }
    return arr.reverse();
};

const stringTo8BitArray = (str: string): number[] => {
    const arr: number[] = [];

    for (let i = 0; i < str.length; i++) {
        const num = str.charCodeAt(i);
        arr.push(num);
    }

    return arr;
};

export { numberTo8bitArray, numberTo8bitArrayFixedSize, stringTo8BitArray };
