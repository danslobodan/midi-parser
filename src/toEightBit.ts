const numberTo8bitArray = (num: number): number[] => {
    const size = Math.ceil(num.toString(2).length / 8);
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

export { numberTo8bitArray, stringTo8BitArray };
