// There are 128 MIDI controllers defined, but only a few of them are used in practice.
// The purpose of a MIDI controller is to set a value of a parameter in the synthesizer playing the notes,
// like the volume, the panoramic (position in space from left to right in stereo), the level of reverberation,...

// The message is constructed as follows:

// Status byte : 1011 CCCC
// Data byte 1 : 0NNN NNNN
// Data byte 2 : 0VVV VVVV
// where CCCC is the MIDI channel, NNNNNNN is the controller number (from 0 to 127) and VVVVVVV is the value
// assigned to the controller (also from 0 to 127).

// The most common controller numbers are the following:

// 0 = Sound bank selection (MSB)
// 1 = Modulation wheel, often assigned to a vibrato or tremolo effect.
// 7 = Volume level of the instrument
// 10 = Panoramic (0 = left; 64 = center; 127 = right)
// 11 = Expression (sometimes used also for volume control or similar, depending on the synthesizer)
// 32 = Sound bank selection (LSB)
// 64 = Sustain pedal (0 = no pedal; >= 64 => pedal ON)
// 121 = All controllers off (this message clears all the controller values for this channel, back to their default values)
// 123 = All notes off (this message stops all the notes that are currently playing)

class MidiController {
    public channel: Channel;
    public controllerNubmer: ControllerNumber;
    public controllerValue: ControllerValue;

    constructor(statusByte: number, dataByte1: number, dataByte2: number) {
        this.channel = new Channel(statusByte);
        this.controllerNubmer = new ControllerNumber(dataByte1);
        this.controllerValue = new ControllerValue(dataByte2);
    }
}

class ControllerNumber {
    private value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < 0 || dataByte > 127)
            throw Error("Controller number value must be between 0 and 127");

        this.value = dataByte;
    }

    public Value(): number {
        return this.value;
    }
}

class ControllerValue {
    private value: number = 0;

    constructor(dataByte: number) {
        if (dataByte < 0 || dataByte > 127)
            throw Error("Controller value must be between 0 and 127");

        this.value = dataByte;
    }

    public Value(): number {
        return this.value;
    }
}
