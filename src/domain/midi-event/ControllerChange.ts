// There are 128 MIDI controllers defined, but only a few of them are used in practice.
// The purpose of a MIDI controller is to set a value of a parameter in the synthesizer playing the notes,
// like the volume, the panoramic (position in space from left to right in stereo), the level of reverberation,...

// The message is constructed as follows:

// Status byte : 1011 CCCC
// Data byte 1 : 0NNN NNNN
// Data byte 2 : 0VVV VVVV
// where CCCC is the MIDI channel, NNNNNNN is the controller number (from 0 to 127) and VVVVVVV is the value
// assigned to the controller (also from 0 to 127).

import { IRegularEvent } from './IRegularEvent';
import { ControllerNumber } from './midi-component';

export interface ControllerChange extends IRegularEvent {
    controlName: string;
    controllerNubmer: ControllerNumber;
    controllerValue: number;
}
