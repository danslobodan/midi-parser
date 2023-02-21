// The Pitch Bend message is used to vary the pitch of the notes that are playing on the current MIDI channel.
// The message is the following:

// Status byte : 1110 CCCC
// Data byte 1 : 0LLL LLLL
// Data byte 2 : 0MMM MMMM

// where CCCC is the MIDI channel, LLLLLLL is the LSB of the pitch bend value and MMMMMMM is the MSB.
// The 14 bit value of the pitch bend is defined so that a value of 0x2000 is the center corresponding
// to the normal pitch of the note (no pitch change).

import { EventType } from "../IMidiEvent";
import { IRegularEvent } from "./IRegularEvent";
import { Channel, BendValue } from "./midi-component";
import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";

export class PitchBend implements IRegularEvent {
    public name = "Pitch Bend";
    public deltaTime: number;
    public type = EventType.PITCH_BEND;
    public channel: Channel;
    public bendValue: BendValue;
    public runningStatus: boolean;

    constructor(
        deltaTime: number,
        channel: Channel,
        bendValue: BendValue,
        runningStatus: boolean
    ) {
        this.deltaTime = deltaTime;
        this.channel = channel;
        this.bendValue = bendValue;
        this.runningStatus = runningStatus;
    }

    public encode(): number[] {
        if (this.runningStatus) {
            return [
                ...numberTo8bitArrayVariableLength(this.deltaTime),
                ...numberTo8bitArray(this.bendValue.Value(), 2),
            ];
        }

        return [
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray((this.type << 4) + this.channel.Value(), 1),
            ...numberTo8bitArray(this.bendValue.Value(), 2),
        ];
    }
}
