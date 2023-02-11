import { numberTo8bitArray, stringTo8BitArray } from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class StringMetaEvent implements MetaEvent {
    public name: string;
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType;
    public data: string;

    constructor(metaType: number, data: string, deltaTime: number) {
        this.name = MetaEventType[metaType] || "Unkown Sytem Message";
        this.metaType = metaType;
        this.deltaTime = deltaTime;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArray(this.type),
            ...numberTo8bitArray(this.metaType),
            ...stringTo8BitArray(this.data),
        ];
        return arr;
    }
}

export { StringMetaEvent };
