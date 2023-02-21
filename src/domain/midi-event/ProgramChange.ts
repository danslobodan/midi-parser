// The MIDI message used to specify the instrument is called a "program change" message.
// It has one STATUS byte and one DATA byte :

// Status byte : 1100 CCCC
// Data byte 1 : 0XXX XXXX

import { EventType } from "../IMidiEvent";
import { IRegularEvent } from "./IRegularEvent";
import { Channel, Instrument } from "./midi-component";
import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";

export class ProgramChange implements IRegularEvent {
    public deltaTime: number;
    public channel: Channel;
    public name = "Program Change";
    public type = EventType.PROGRAM_CHANGE;
    public runningStatus: boolean;

    public instrument: Instrument;

    constructor(
        deltaTime: number,
        channel: Channel,
        instrument: Instrument,
        runningStatus: boolean
    ) {
        this.deltaTime = deltaTime;
        this.channel = channel;
        this.instrument = instrument;
        this.runningStatus = runningStatus;
    }

    public encode(): number[] {
        if (this.runningStatus) {
            return [
                ...numberTo8bitArrayVariableLength(this.deltaTime),
                ...numberTo8bitArray(this.instrument.Value(), 1),
            ];
        }

        return [
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray((this.type << 4) + this.channel.Value(), 1),
            ...numberTo8bitArray(this.instrument.Value(), 1),
        ];
    }
}
