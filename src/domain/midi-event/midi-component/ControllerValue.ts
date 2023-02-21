export class ControllerValue {
    private value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < 0 || dataByte > 127)
            throw Error("Controller value must be between 0 and 127");

        this.value = dataByte;
    }

    public Value(): number {
        return this.value;
    }
}
