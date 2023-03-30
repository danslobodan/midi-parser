import { EventType } from '../IMidiEvent';
import { IMetaEvent, MetaEventType } from './IMetaEvent';

export class SetTempo implements IMetaEvent {
    public eventName: string = 'Set Tempo';
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
}
