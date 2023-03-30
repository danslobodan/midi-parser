// The MIDI message used to specify the instrument is called a "program change" message.
// It has one STATUS byte and one DATA byte :

// Status byte : 1100 CCCC
// Data byte 1 : 0XXX XXXX

import { IRegularEvent } from './IRegularEvent';
import { Instrument } from './midi-component';

export interface ProgramChange extends IRegularEvent {
    instrument: Instrument;
}
