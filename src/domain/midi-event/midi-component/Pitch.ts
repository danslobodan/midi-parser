const MIN_NOTE = 21;
const MAX_NOTE = 108;

class Pitch {
    public note: string;
    public value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < MIN_NOTE || dataByte > MAX_NOTE)
            throw Error(
                `Note pitch value must be between ${MIN_NOTE} and ${MAX_NOTE}`
            );

        this.note = pitchString[dataByte];
        this.value = dataByte;
    }
}

export { Pitch };

enum Notes {
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
}

const pitchString = (() => {
    const values = [];

    for (let i = MIN_NOTE; i <= MAX_NOTE; i++) {
        values[i] = Notes[i % 12] + Math.floor(i / 12 - 1);
    }

    return values;
})();
