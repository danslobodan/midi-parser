import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeFile, encodeFile, IMidiFile } from "./domain/MidiFile";
import { joinMidi } from "./joinMidi";

const start = () => {
    console.log("Program Started");

    const midi44 = loadMidiFile("midi/Midi_44_2.mid");
    const midi34 = loadMidiFile("midi/Midi_34_2.mid");
    const midi54 = loadMidiFile("midi/Midi_54_2.mid");

    fs.writeFileSync("midi44.json", JSON.stringify(midi44, null, 2));
    fs.writeFileSync("midi34.json", JSON.stringify(midi34, null, 2));
    fs.writeFileSync("midi54.json", JSON.stringify(midi54, null, 2));

    const midi = joinMidi([midi44, midi34, midi54]);
    // const midiFile = loadMidiFile("midi/MidiMerged_44_34_54.mid");

    fs.writeFileSync("result.json", JSON.stringify(midi, null, 2));
    const encoded = encodeFile(midi);
    const uint = new Uint8Array(encoded);

    fs.writeFileSync("uint.json", JSON.stringify(uint, null, 2));
    fs.writeFileSync("midi/generated.mid", uint);
};

const loadMidiFile = (fileName: string): IMidiFile => {
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
