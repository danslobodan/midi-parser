const MIN_NOTE = 21;
const MAX_NOTE = 108;

class Pitch {
    private name: string;
    private value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < MIN_NOTE || dataByte > MAX_NOTE)
            throw Error(
                `Note pitch value must be between ${MIN_NOTE} and ${MAX_NOTE}`
            );

        this.name = pitchString[dataByte];
        this.value = dataByte;
    }

    public Name() {
        return this.name;
    }

    public Value() {
        return this.value;
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
        const note = Notes[i % 12];
        const scaleNumber = Math.floor(i / 12 - 1);
        values[i] = note + scaleNumber;
    }

    return values;
})();
