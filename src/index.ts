import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeFile, encodeFile, MidiFile } from "./domain/MidiFile";

const start = () => {
    console.log("Program Started");

    const midiFile = loadMidiFile("midi/Midi_54_1.mid");

    fs.writeFileSync("result.json", JSON.stringify(midiFile, null, 2));

    const encoded = encodeFile(midiFile);
    const uint = new Uint8Array(encoded);

    fs.writeFileSync("midi/generated.mid", uint);
};

const loadMidiFile = (fileName: string): MidiFile => {
    const data = fs.readFileSync(fileName);
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength
    );

    fs.writeFileSync(
        "uint.json",
        JSON.stringify(new Uint8Array(data), null, 2)
    );

    const dataStream = new DataStream(dataView);
    const midiFile = decodeFile(dataStream);

    return midiFile;
};

start();
