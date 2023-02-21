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

import { EventType } from "../IMidiEvent";
import { IRegularEvent } from "./IRegularEvent";
import { Channel, ControllerNumber, ControllerValue } from "./midi-component";
import {
    numberTo8bitArrayVariableLength,
    numberTo8bitArray,
} from "../../toEightBit";

export class ControllerChange implements IRegularEvent {
    public name = "Controller Change";
    public deltaTime: number;
    public type = EventType.CONTROLLER_CHANGE;
    public channel: Channel;
    public controllerNubmer: ControllerNumber;
    public controllerValue: ControllerValue;
    public runningStatus: boolean;

    constructor(
        deltaTime: number,
        channel: Channel,
        controllerNubmer: ControllerNumber,
        controllerValue: ControllerValue,
        runningStatus: boolean
    ) {
        this.deltaTime = deltaTime;
        this.channel = channel;
        this.controllerNubmer = controllerNubmer;
        this.controllerValue = controllerValue;
        this.runningStatus = runningStatus;
    }

    public encode(): number[] {
        if (this.runningStatus) {
            return [
                ...numberTo8bitArrayVariableLength(this.deltaTime),
                ...numberTo8bitArray(this.controllerNubmer.Value(), 1),
                ...numberTo8bitArray(this.controllerValue.Value(), 1),
            ];
        }

        return [
            ...numberTo8bitArrayVariableLength(this.deltaTime),
            ...numberTo8bitArray((this.type << 4) + this.channel.Value(), 1),
            ...numberTo8bitArray(this.controllerNubmer.Value(), 1),
            ...numberTo8bitArray(this.controllerValue.Value(), 1),
        ];
    }
}
