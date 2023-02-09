class Channel {
    private value: number = 0;

    constructor(statusByte: number) {
        const channel = statusByte & 0b00001111;
        if (channel < 0 || channel > 15)
            throw Error("Channel value must be between 0 and 15");

        this.value = channel;
    }

    public Value(): number {
        return this.value;
    }
}
