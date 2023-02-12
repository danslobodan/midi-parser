class Velocity {
    public value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < 0 || dataByte > 127)
            throw Error("Note velocity must be between 0 and 127");

        this.value = dataByte;
    }
}

export { Velocity };
