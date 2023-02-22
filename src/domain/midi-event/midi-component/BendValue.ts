const NO_BEND = 0x2000;

export class BendValue {
    private value: number = NO_BEND;

    constructor(value: number) {
        this.value = value;
    }

    public Value(): number {
        return this.value;
    }
}
