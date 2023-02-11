import { numberTo8bitArray } from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class EndOfTrack implements MetaEvent {
    public name = "End Of Track";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType = MetaEventType.END_OF_TRACK;

    constructor(deltaTime: number) {
        this.deltaTime = deltaTime;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArray(this.type),
            ...numberTo8bitArray(this.metaType),
        ];
        return arr;
    }
}

export { EndOfTrack };
