// The Pitch Bend message is used to vary the pitch of the notes that are playing on the current MIDI channel.
// The message is the following:

// Status byte : 1110 CCCC
// Data byte 1 : 0LLL LLLL
// Data byte 2 : 0MMM MMMM

// where CCCC is the MIDI channel, LLLLLLL is the LSB of the pitch bend value and MMMMMMM is the MSB.
// The 14 bit value of the pitch bend is defined so that a value of 0x2000 is the center corresponding
// to the normal pitch of the note (no pitch change).

import { IRegularEvent } from './IRegularEvent';
import { BendValue } from './midi-component';

export interface PitchBend extends IRegularEvent {
    bendValue: BendValue;
}
