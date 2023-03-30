import { readFileSync, writeFileSync } from 'fs';
import { createStream } from './createMidiStream';
import { decodeFile, encodeFile, IMidiFile } from './domain/MidiFile';
import { joinMidiFiles } from './joinMidi';

import {
    decode as decodeBase64,
    encode as encodeBase64,
} from 'base64-arraybuffer';

const start = () => {
    console.log('Program Started');

    const map = {
        '34': loadMidiFile('midi/Midi_34_2.mid'),
        '44': loadMidiFile('midi/Midi_44_2.mid'),
        '54': loadMidiFile('midi/Midi_54_2.mid'),
        '58': loadMidiFile('midi/Test_58.mid'),
        '68': loadMidiFile('midi/Test_68.mid'),
        '78': loadMidiFile('midi/Test_78.mid'),
        '516': loadMidiFile('midi/Test_516.mid'),
    };

    const midi = joinMidiFiles(['78', '516', '68'], map);

    writeMidiFile('midi/78-516-68.mid', midi);
};

const readAsBase64 = (fileName: string) => {
    const base64 = readFileSync(fileName, { encoding: 'base64' });
    return readBase64(base64);
};

const readBase64 = (base64string: string) => {
    const data = decodeBase64(base64string);
    const dataView = new DataView(data);
    return dataView;
};

const readAsBuffer = (fileName: string) => {
    const data = readFileSync(fileName);
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength
    );
    return dataView;
};

const loadMidiFile = (fileName: string): IMidiFile => {
    const data = readAsBuffer(fileName);
    const stream = createStream(data);
    const midiFile = decodeFile(stream);

    return midiFile;
};

const writeMidiFile = (fileName: string, file: IMidiFile) => {
    const encodded = encodeFile(file);
    const buffer = new Uint8Array(encodded);
    writeFileSync(fileName, buffer);
};

start();
