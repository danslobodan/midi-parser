export class BendValue {
    private value: number = 0x2000;

    constructor(dataByte1: number, dataByte2: number) {
        this.value = (dataByte1 << 8) + dataByte2;
    }

    public Value(): number {
        return this.value;
    }
}
