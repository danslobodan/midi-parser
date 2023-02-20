import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";
import { EventType } from "../IMidiEvent";
import { IMetaEvent, MetaEventType } from "./IMetaEvent";

class TimeSignature implements IMetaEvent {
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
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray(this.type, 1),
            ...numberTo8bitArray(this.metaType, 1),
            ...numberTo8bitArrayVariableLength(this.length),
            ...numberTo8bitArrayVariableLength(this.data[0]),
            ...numberTo8bitArrayVariableLength(this.data[1]),
            ...numberTo8bitArrayVariableLength(this.data[2]),
            ...numberTo8bitArrayVariableLength(this.data[3]),
        ];
        return arr;
    }
}

export { TimeSignature };
