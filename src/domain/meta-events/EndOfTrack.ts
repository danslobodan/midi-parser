import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";
import { EventType } from "../IMidiEvent";
import { IMetaEvent, MetaEventType } from "./IMetaEvent";

class EndOfTrack implements IMetaEvent {
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
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray(this.type, 1),
            ...numberTo8bitArray(this.metaType, 1),
            ...numberTo8bitArrayVariableLength(this.length),
        ];
        return arr;
    }
}

export { EndOfTrack };
