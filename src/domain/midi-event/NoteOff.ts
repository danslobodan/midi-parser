// The NOTE OFF message is structured as follows:

// Status byte : 1000 CCCC
// Data byte 1 : 0PPP PPPP
// Data byte 2 : 0VVV VVVV

// where:

// "CCCC" is the MIDI channel (from 0 to 15)
// "PPP PPPP" is the pitch value (from 0 to 127) - middle C = 60, C# = 61, D = 62
// "VVV VVVV" is the release velocity value (from 0 to 127) - usually 0

import { IRegularEvent } from './IRegularEvent';
import { Pitch } from './midi-component';

export interface NoteOff extends IRegularEvent {
    pitch: Pitch;
    velocity: number;
}
