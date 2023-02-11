import { numberTo8bitArray } from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class SMPTEOffset implements MetaEvent {
    public name = "SMPTE Offset";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType = MetaEventType.SMPTE_OFFSET;
    public data: number[];

    constructor(data: number[], deltaTime: number) {
        this.deltaTime = deltaTime;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArray(this.type),
            ...numberTo8bitArray(this.metaType),
            ...numberTo8bitArray(this.data[0]),
            ...numberTo8bitArray(this.data[1]),
            ...numberTo8bitArray(this.data[2]),
            ...numberTo8bitArray(this.data[3]),
            ...numberTo8bitArray(this.data[4]),
        ];
        return arr;
    }
}

export { SMPTEOffset };
