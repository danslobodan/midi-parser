import { IMidiEvent } from "../IMidiEvent";

export interface IRegularEvent extends IMidiEvent {
    channel: number;
}
