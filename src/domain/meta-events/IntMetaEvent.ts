import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";
import { EventType } from "../IMidiEvent";
import { IMetaEvent, MetaEventType } from "./IMetaEvent";

class IntMetaEvent implements IMetaEvent {
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
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray(this.type, 1),
            ...numberTo8bitArray(this.metaType, 1),
            ...numberTo8bitArrayVariableLength(this.length),
            ...numberTo8bitArray(this.data, 1),
        ];
        return arr;
    }
}

export { IntMetaEvent };
