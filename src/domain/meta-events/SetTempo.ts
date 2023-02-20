import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";
import { EventType } from "../IMidiEvent";
import { IMetaEvent, MetaEventType } from "./IMetaEvent";

class SetTempo implements IMetaEvent {
    public name: string = "Set Tempo";
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType = MetaEventType.SET_TEMPO;
    public length: number;
    public data: number;

    constructor(deltaTime: number, length: number, data: number) {
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
            ...numberTo8bitArray(this.data, this.length),
        ];
        return arr;
    }
}

export { SetTempo };
