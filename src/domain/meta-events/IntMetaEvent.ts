import { numberTo8bitArray } from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class IntMetaEvent implements MetaEvent {
    public name: string;
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType;
    public length: number;
    public data: number;

    constructor(
        deltaTime: number,
        length: number,
        metaType: MetaEventType,
        data: number
    ) {
        this.deltaTime = deltaTime;
        this.name = MetaEventType[metaType] || "Unkown Sytem Message";
        this.metaType = metaType;
        this.length = length;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArray(this.type),
            ...numberTo8bitArray(this.metaType),
            ...numberTo8bitArray(this.data),
        ];
        return arr;
    }
}

export { IntMetaEvent };
