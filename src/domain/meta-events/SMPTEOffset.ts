import {
    numberTo8bitArray,
    numberTo8bitArrayFixedSize,
} from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class SMPTEOffset implements MetaEvent {
    public name = "SMPTE Offset";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType = MetaEventType.SMPTE_OFFSET;
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
            ...numberTo8bitArrayFixedSize(this.data[0], 1),
            ...numberTo8bitArrayFixedSize(this.data[1], 1),
            ...numberTo8bitArrayFixedSize(this.data[2], 1),
            ...numberTo8bitArrayFixedSize(this.data[3], 1),
            ...numberTo8bitArrayFixedSize(this.data[4], 1),
        ];
        return arr;
    }
}

export { SMPTEOffset };
