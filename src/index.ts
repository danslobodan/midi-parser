import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeFile, encodeFile, MidiFile } from "./domain/MidiFile";

const start = () => {
    console.log("Program Started");

    const midi44 = loadMidiFile("midi/Midi_44_1.mid");

    fs.writeFileSync("result.json", JSON.stringify(midi44, null, 2));

    const encoded = encodeFile(midi44);
    const uint = new Uint8Array(encoded);

    fs.writeFileSync("uint.json", JSON.stringify(uint, null, 2));
    fs.writeFileSync("midi/generated.mid", uint);
};

const loadMidiFile = (fileName: string): MidiFile => {
    const data = fs.readFileSync(fileName);
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength
    );
    const dataStream = new DataStream(dataView);
    const midiFile = decodeFile(dataStream);

    return midiFile;
};

start();
