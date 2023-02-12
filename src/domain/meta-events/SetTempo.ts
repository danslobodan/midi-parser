import { numberTo8bitArray } from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class SetTempo implements MetaEvent {
    public name: string = "Set Tempo";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType = MetaEventType.SET_TEMPO;
    public length: number;
    public data: number;

    constructor(deltaTime: number, length: number, data: number) {
        this.deltaTime = deltaTime;
        this.length = length;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArray(this.type),
            ...numberTo8bitArray(this.metaType),
            ...numberTo8bitArray(this.length),
            ...numberTo8bitArray(this.data),
        ];
        return arr;
    }
}

export { SetTempo };
