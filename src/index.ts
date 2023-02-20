import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeFile, encodeFile } from "./domain/MidiFile";

const start = () => {
    console.log("Program Started");

    const data = fs.readFileSync("midi34.mid");
    const dataView = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength
    );
    const dataStream = new DataStream(dataView);
    const midiFile = decodeFile(dataStream);

    fs.writeFileSync("result.json", JSON.stringify(midiFile, null, 2));

    const encoded = encodeFile(midiFile);
    const uint = new Uint8Array(encoded);

    fs.writeFileSync("uint.json", JSON.stringify(uint, null, 2));
    fs.writeFileSync("midi34-new.mid", uint);
};

start();
