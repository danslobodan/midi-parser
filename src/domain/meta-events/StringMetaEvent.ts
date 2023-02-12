import {
    numberTo8bitArray,
    stringTo8BitArray,
    numberTo8bitArrayFixedSize,
} from "../../toEightBit";
import { EventType } from "../EventType";
import { MetaEventType } from "../MetaEventType";
import { MetaEvent } from "../MidiEvent";

class StringMetaEvent implements MetaEvent {
    public name: string;
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType;
    public length: number;
    public data: string;

    constructor(
        deltaTime: number,
        metaType: number,
        length: number,
        data: string
    ) {
        this.name = MetaEventType[metaType] || "Unkown Sytem Message";
        this.metaType = metaType;
        this.length = length;
        this.deltaTime = deltaTime;
        this.data = data;
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArrayFixedSize(this.type, 1),
            ...numberTo8bitArrayFixedSize(this.metaType, 1),
            ...numberTo8bitArray(this.length),
            ...stringTo8BitArray(this.data),
        ];
        return arr;
    }
}

export { StringMetaEvent };
