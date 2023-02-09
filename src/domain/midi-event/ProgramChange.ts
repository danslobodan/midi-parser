// The MIDI message used to specify the instrument is called a "program change" message.
// It has one STATUS byte and one DATA byte :

// Status byte : 1100 CCCC
// Data byte 1 : 0XXX XXXX

class ProgramChange {
    public channel: Channel;
    public instrument: Instrument;

    constructor(statusByte: number, dataByte: number) {
        this.channel = new Channel(statusByte);
        this.instrument = new Instrument(dataByte);
    }
}
