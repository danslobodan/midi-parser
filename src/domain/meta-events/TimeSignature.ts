import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

class TimeSignature implements IMetaEvent {
    public eventName = 'Time Signature';
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
}

export { TimeSignature };
