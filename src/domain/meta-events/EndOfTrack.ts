import {
    numberTo8bitArray,
    numberTo8bitArrayFixedSize,
} from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class EndOfTrack implements MetaEvent {
    public name = "End Of Track";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType = MetaEventType.END_OF_TRACK;
    public length: number;

    constructor(deltaTime: number, length: number) {
        this.deltaTime = deltaTime;
        this.length = length;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArrayFixedSize(this.type, 1),
            ...numberTo8bitArrayFixedSize(this.metaType, 1),
            ...numberTo8bitArray(this.length),
        ];
        return arr;
    }
}

export { EndOfTrack };
