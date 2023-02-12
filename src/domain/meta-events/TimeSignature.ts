import {
    numberTo8bitArray,
    numberTo8bitArrayFixedSize,
} from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class TimeSignature implements MetaEvent {
    public name = "Time Signature";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType = MetaEventType.TIME_SIGNATURE;
    public length: number;
    public data: number[];

    constructor(deltaTime: number, length: number, data: number[]) {
        this.deltaTime = deltaTime;
        this.length = length;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArrayFixedSize(this.type, 1),
            ...numberTo8bitArrayFixedSize(this.metaType, 1),
            ...numberTo8bitArray(this.length),
            ...numberTo8bitArray(this.data[0]),
            ...numberTo8bitArray(this.data[1]),
            ...numberTo8bitArray(this.data[2]),
            ...numberTo8bitArray(this.data[3]),
        ];
        return arr;
    }
}

export { TimeSignature };
