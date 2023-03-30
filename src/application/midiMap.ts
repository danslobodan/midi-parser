import { IMidiFile } from '../domain/MidiFile';

export interface IMidiMap {
    [key: string]: IMidiFile;
}
