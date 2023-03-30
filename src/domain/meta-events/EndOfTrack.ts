import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

class EndOfTrack implements IMetaEvent {
    public eventName = 'End Of Track';
    public deltaTime: number;
    public type = EventType.META_EVENT_TYPE;
    public metaType: MetaEventType = MetaEventType.END_OF_TRACK;
    public length: number;

    constructor(deltaTime: number, length: number) {
        this.deltaTime = deltaTime;
        this.length = length;
    }
}

export { EndOfTrack };
