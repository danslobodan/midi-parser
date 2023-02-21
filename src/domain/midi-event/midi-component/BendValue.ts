export class BendValue {
    private value: number = 0x2000;

    constructor(value: number) {
        this.value = value;
    }

    public Value(): number {
        return this.value;
    }
}
