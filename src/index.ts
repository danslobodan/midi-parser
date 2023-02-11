import fs from "fs";
import { DataStream } from "./DataStream";
import { decodeMidi } from "./domain/MidiFile";

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

    fs.writeFileSync("result.json", JSON.stringify(midiFile, null, 2));

    const encoded = midiFile.encode();
    const uint = new Uint8Array(encoded);

    console.log("before", new Uint8Array(data));
    console.log("after", uint);
};

start();
