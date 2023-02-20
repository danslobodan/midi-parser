import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";
import { EventType } from "../IMidiEvent";
import { IMetaEvent, MetaEventType } from "./IMetaEvent";

class SMPTEOffset implements IMetaEvent {
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
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray(this.type, 1),
            ...numberTo8bitArray(this.metaType, 1),
            ...numberTo8bitArrayVariableLength(this.length),
            ...numberTo8bitArray(this.data[0], 1),
            ...numberTo8bitArray(this.data[1], 1),
            ...numberTo8bitArray(this.data[2], 1),
            ...numberTo8bitArray(this.data[3], 1),
            ...numberTo8bitArray(this.data[4], 1),
        ];
        return arr;
    }
}

export { SMPTEOffset };
