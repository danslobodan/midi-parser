import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

class SMPTEOffset implements IMetaEvent {
    public eventName = 'SMPTE Offset';
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
}

export { SMPTEOffset };
