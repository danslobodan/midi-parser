// The NOTE ON message is structured as follows:

// Status byte : 1001 CCCC
// Data byte 1 : 0PPP PPPP
// Data byte 2 : 0VVV VVVV

// where:

// "CCCC" is the MIDI channel (from 0 to 15)
// "PPP PPPP" is the pitch value (from 0 to 127) - middle C = 60, C# = 61, D = 62
// "VVV VVVV" is the velocity value (from 0 to 127)

class NoteOn {
    public name = "Note On";
    public channel: Channel;
    public pitch: Pitch;
    public velocity: Velocity;

    constructor(statusByte: number, dataByte1: number, dataByte2: number) {
        this.channel = new Channel(statusByte);
        this.pitch = new Pitch(dataByte1);
        this.velocity = new Velocity(dataByte2);
    }
}

export type { NoteOn };
