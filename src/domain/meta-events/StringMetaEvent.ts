import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

class StringMetaEvent implements IMetaEvent {
    public eventName: string;
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
        this.eventName = MetaEventType[metaType] || 'Unkown Sytem Message';
        this.metaType = metaType;
        this.length = length;
        this.deltaTime = deltaTime;
        this.data = data;
    }
}

export { StringMetaEvent };
