import { IMidiEvent } from "../IMidiEvent";
import { Channel } from "./midi-component";

export interface IRegularEvent extends IMidiEvent {
    channel: Channel;
    runningStatus: boolean;
}
