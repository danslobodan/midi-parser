import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeMidi } from "./domain/MidiFile";
import { Uint8ToMidi } from "./old/MidiParser";

const start = () => {
    console.log("Program Started");

    const data = fs.readFileSync("midi34.mid");
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength
    );
    const dataStream = new DataStream(dataView);
    const midiFile = decodeMidi(dataStream);

    const old = Uint8ToMidi(dataView);

    fs.writeFileSync("result.json", JSON.stringify(midiFile, null, 2));
    fs.writeFileSync("old.json", JSON.stringify(old, null, 2));
};

start();
