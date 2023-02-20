import { DataStream, IDataStream } from "../DataStream";
import { numberTo8bitArray } from "../toEightBit";
import { getTrack, MidiTrack } from "./MidiTrack";

interface MidiFile {
    header: MidiHeader;
    tracks: MidiTrack[];
    encode: () => number[];
}

enum MidiFileFormat {
    SingleTrack = 0,
    MultiTrackSync = 1,
    MultiTrackAsync = 2,
}

interface MidiHeader {
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
    const tracks = getTracks(dataStream, numberOfTracks);

    const encodeTracks = (tracks: MidiTrack[]) => {
        const encoded: number[] = [];
        for (let i = 0; i < tracks.length; i++) {
            const encodedTrack = tracks[i].encode();
            encoded.push(...encodedTrack);
        }
        return encoded;
    };

    const midiFile = {
        header: {
            midiIdentifier: midiIdentifier.toString(16),
            headerSize,
            fileFormat,
            numberOfTracks,
            timeDivision,
        },
        tracks,
        encode: (): number[] => {
            return [
                ...numberTo8bitArray(midiIdentifier, 4),
                ...numberTo8bitArray(headerSize, 4),
                ...numberTo8bitArray(fileFormat, 2),
                ...numberTo8bitArray(numberOfTracks, 2),
                ...numberTo8bitArray(timeDivision, 2),
                ...encodeTracks(tracks),
            ];
        },
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
        const trackHeader = dataStream.readInt(4);

        if (trackHeader === END_OF_FILE) break;
        if (trackHeader !== TRACK_HEADER_SIGNATURE) return tracks;

        const track = getTrack(dataStream);
        tracks.push(track);
    }

    return tracks;
};

export type { MidiFile, MidiFileFormat };
