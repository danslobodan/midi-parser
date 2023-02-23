import fs from "fs";
import { createStream } from "./createMidiStream";
import { decode, encodeFile, IMidiFile } from "./domain/MidiFile";
import { joinMidiData } from "./joinMidi";

import { decode as decodeBase64 } from "base64-arraybuffer";

const start = () => {
    console.log("Program Started");

    // return;
    const midi44 = readAsBuffer("midi/Midi_44_2.mid");
    const midi34 = readAsBuffer("midi/Midi_34_2.mid");
    const midi54 = readAsBuffer("midi/Midi_54_2.mid");

    // fs.writeFileSync("midi44.json", JSON.stringify(midi44, null, 2));
    // fs.writeFileSync("midi34.json", JSON.stringify(midi34, null, 2));
    // fs.writeFileSync("midi54.json", JSON.stringify(midi54, null, 2));

    // const midi = joinMidiFiles([midi44, midi34, midi54]);
    // const midiFile = loadMidiFile("midi/MidiMerged_44_34_54.mid");

    const midi = joinMidiData([midi44, midi34, midi54]);

    fs.writeFileSync("result.json", JSON.stringify(midi, null, 2));
    const encoded = encodeFile(midi);
    const uint = new Uint8Array(encoded);

    fs.writeFileSync("uint.json", JSON.stringify(uint, null, 2));
    fs.writeFileSync("midi/generated.mid", uint);
};

const readAsBase64 = (fileName: string) => {
    const base64 = fs.readFileSync(fileName, { encoding: "base64" });
    return readBase64(base64);
};

const readBase64 = (base64string: string) => {
    const data = decodeBase64(base64string);
    const dataView = new DataView(data);
    return dataView;
};

const readAsBuffer = (fileName: string) => {
    const data = fs.readFileSync(fileName);
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
    const midiFile = decode(stream);

    return midiFile;
};

start();
