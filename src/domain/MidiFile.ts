import { DataStream, IDataStream } from "../DataStream";
import { getTrack, MidiTrack } from "./MidiTrack";

interface MidiFile {
    header: MidiHeader;
    tracks: MidiTrack[];
}

enum MidiFileFormat {
    SingleTrack = 0,
    MultiTrackSync = 1,
    MultiTrackAsync = 2,
}

interface MidiHeader {
    // must be 0x4d546864
    midiIdentifier: string;
    headerSize: number;
    fileFormat: MidiFileFormat;
    numberOfTracks: number;
    timeDivision: number;
}

export const decodeMidi = (dataStream: DataStream): MidiFile => {
    const midiIdentifier = dataStream.readInt(4);

    if (midiIdentifier !== 0x4d546864) {
        throw Error("Invalid header");
    }

    const headerSize = dataStream.readInt(4);
    const fileFormat: MidiFileFormat = dataStream.readInt(2);
    const numberOfTracks = dataStream.readInt(2);
    const timeDivision = dataStream.readInt(2);

    const midiFile = {
        header: {
            midiIdentifier: midiIdentifier.toString(16),
            headerSize,
            fileFormat,
            numberOfTracks,
            timeDivision,
        },
        tracks: getTracks(dataStream, numberOfTracks),
    };

    return midiFile;
};

const TRACK_HEADER_SIGNATURE = 0x4d54726b;
const END_OF_FILE = -1;

const getTracks = (
    dataStream: IDataStream,
    numberOfTracks: number
): MidiTrack[] => {
    const tracks: MidiTrack[] = [];

    for (let i = 1; i <= numberOfTracks; i++) {
        // create new Track entry in Array
        let trackHeader = dataStream.readInt(4);

        // EOF
        if (trackHeader === END_OF_FILE) break;
        // Track chunk header validation failed.
        if (trackHeader !== TRACK_HEADER_SIGNATURE) return tracks;

        // move pointer. get chunk size (bytes length)
        const track = getTrack(trackHeader, dataStream);
        tracks.push(track);
    }

    return tracks;
};

export type { MidiFile, MidiFileFormat };
