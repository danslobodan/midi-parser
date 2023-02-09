import fs from "fs";
import { MidiFile } from "./domain/MidiFile";

const start = () => {
    console.log("Program Started");

    const data = fs.readFileSync("midi34.mid");

    const midiIdentifier = data.readUint32BE();

    console.log(midiIdentifier);
    if (midiIdentifier !== 0x4d546864) {
        console.error("Header invalid");
        return;
    }

    const headerSize = data.readUint32BE(4);
    const fileFormat = data.readUint16BE(8);
    const numberOfTracks = data.readUint16BE(10);
    const timeDivision = data.readUint16BE(12);

    const midiFile: MidiFile = {
        header: {
            midiIdentifier,
            headerSize,
            fileFormat,
            numberOfTracks,
            timeDivision,
        },
    };

    console.log(midiFile);
};

start();
