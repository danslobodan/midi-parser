// The NOTE OFF message is structured as follows:

// Status byte : 1000 CCCC
// Data byte 1 : 0PPP PPPP
// Data byte 2 : 0VVV VVVV

// where:

// "CCCC" is the MIDI channel (from 0 to 15)
// "PPP PPPP" is the pitch value (from 0 to 127) - middle C = 60, C# = 61, D = 62
// "VVV VVVV" is the release velocity value (from 0 to 127) - usually 0

import { EventType } from "../EventType";
import { RegularEvent } from "../MidiEvent";
import { Pitch } from "./midi-component/Pitch";
import { Velocity } from "./midi-component/Velocity";

class NoteOff implements RegularEvent {
    public name = "Note Off";
    public type = EventType.NOTE_OFF;
    public channel: number;
    public deltaTime: number;
    public data: number[];

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
        this.data = [dataByte1, dataByte2];
        this.pitch = new Pitch(dataByte1);
        this.velocity = new Velocity(dataByte2);
    }
}

export { NoteOff };
