// The NOTE ON message is structured as follows:

// Status byte : 1001 CCCC
// Data byte 1 : 0PPP PPPP
// Data byte 2 : 0VVV VVVV

// where:

// "CCCC" is the MIDI channel (from 0 to 15)
// "PPP PPPP" is the pitch value (from 0 to 127) - middle C = 60, C# = 61, D = 62
// "VVV VVVV" is the velocity value (from 0 to 127)

import {
    numberTo8bitArray,
    numberTo8bitArrayFixedSize,
} from "../../toEightBit";
import { EventType } from "../EventType";
import { RegularEvent } from "../MidiEvent";
import { Pitch } from "./midi-component/Pitch";
import { Velocity } from "./midi-component/Velocity";

class NoteOn implements RegularEvent {
    public name = "Note On";
    public deltaTime: number;
    public type = EventType.NOTE_ON;
    public channel: number;
    public pitch: Pitch;
    public velocity: Velocity;

    constructor(
        statusByte: number,
        dataByte1: number,
        dataByte2: number,
        deltaTime: number
    ) {
        this.channel = statusByte & 0b00001111;
        this.deltaTime = deltaTime;
        this.pitch = new Pitch(dataByte1);
        this.velocity = new Velocity(dataByte2);
    }

    public encode(): number[] {
        const arr = [
            ...numberTo8bitArray(this.deltaTime),
            ...numberTo8bitArrayFixedSize((this.type << 4) + this.channel, 1),
            ...numberTo8bitArrayFixedSize(this.pitch.value, 1),
            ...numberTo8bitArrayFixedSize(this.velocity.value, 1),
        ];
        return arr;
    }
}

export { NoteOn };
