// The NOTE ON message is structured as follows:

// Status byte : 1001 CCCC
// Data byte 1 : 0PPP PPPP
// Data byte 2 : 0VVV VVVV

// where:

// "CCCC" is the MIDI channel (from 0 to 15)
// "PPP PPPP" is the pitch value (from 0 to 127) - middle C = 60, C# = 61, D = 62
// "VVV VVVV" is the velocity value (from 0 to 127)

import { IRegularEvent } from "./IRegularEvent";
import { EventType } from "../IMidiEvent";
import { Pitch } from "./midi-component";
import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";

class NoteOn implements IRegularEvent {
    public name = "Note On";
    public deltaTime: number;
    public type = EventType.NOTE_ON;
    public channel: number;
    public pitch: Pitch;
    public velocity: number;
    public runningStatus: boolean;

    constructor(
        deltaTime: number,
        channel: number,
        pitch: number,
        velocity: number,
        runningStatus: boolean
    ) {
        this.channel = channel;
        this.deltaTime = deltaTime;
        this.pitch = new Pitch(pitch);
        this.velocity = velocity;
        this.runningStatus = runningStatus;
    }

    public encode(): number[] {
        if (this.runningStatus) {
            return [
                ...numberTo8bitArrayVariableLength(this.deltaTime),
                ...numberTo8bitArray(this.pitch.Value(), 1),
                ...numberTo8bitArray(this.velocity, 1),
            ];
        }

        return [
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray((this.type << 4) + this.channel, 1),
            ...numberTo8bitArray(this.pitch.Value(), 1),
            ...numberTo8bitArray(this.velocity, 1),
        ];
    }
}

export { NoteOn };
