import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

class IntMetaEvent implements IMetaEvent {
    public eventName: string;
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
        this.eventName = MetaEventType[metaType] || 'Unkown Sytem Message';
        this.metaType = metaType;
        this.length = length;
        this.data = data;
    }
}

export { IntMetaEvent };
