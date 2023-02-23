import { IDataStream } from "../DataStream";
import { numberTo8bitArray } from "../toEightBit";
import { decodeTrack, encodeTrack, IMidiTrack } from "./MidiTrack";

interface IMidiFile {
    header: MidiHeader;
    tracks: IMidiTrack[];
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

const MIDI_FILE_SIGNATURE = 0x4d546864;

export const decodeFile = (dataStream: IDataStream): IMidiFile => {
    const midiIdentifier = dataStream.readInt(4);

    if (midiIdentifier !== MIDI_FILE_SIGNATURE) {
        throw Error("Invalid midi file header");
    }

    const headerSize = dataStream.readInt(4);
    const fileFormat: MidiFileFormat = dataStream.readInt(2);
    const numberOfTracks = dataStream.readInt(2);
    const timeDivision = dataStream.readInt(2);
    const tracks = decodeTracks(dataStream, numberOfTracks);

    const midiFile = {
        header: {
            midiIdentifier: midiIdentifier.toString(16),
            headerSize,
            fileFormat,
            numberOfTracks,
            timeDivision,
        },
        tracks,
    };

    return midiFile;
};

const TRACK_HEADER_SIGNATURE = 0x4d54726b;
const END_OF_FILE = -1;

const decodeTracks = (
    dataStream: IDataStream,
    numberOfTracks: number
): IMidiTrack[] => {
    const tracks: IMidiTrack[] = [];

    for (let i = 1; i <= numberOfTracks; i++) {
        const trackHeader = dataStream.readInt(4);

        if (trackHeader === END_OF_FILE) break;
        if (trackHeader !== TRACK_HEADER_SIGNATURE) return tracks;

        const track = decodeTrack(dataStream);
        tracks.push(track);
    }

    return tracks;
};

const encodeTracks = (tracks: IMidiTrack[]) => {
    const encoded: number[] = [];
    for (let i = 0; i < tracks.length; i++) {
        const encodedTrack = encodeTrack(tracks[i]);
        encoded.push(...encodedTrack);
    }
    return encoded;
};

export const encodeFile = (midiFile: IMidiFile): number[] => {
    const {
        header: { headerSize, fileFormat, numberOfTracks, timeDivision },
    } = midiFile;

    return [
        ...numberTo8bitArray(MIDI_FILE_SIGNATURE, 4),
        ...numberTo8bitArray(headerSize, 4),
        ...numberTo8bitArray(fileFormat, 2),
        ...numberTo8bitArray(numberOfTracks, 2),
        ...numberTo8bitArray(timeDivision, 2),
        ...encodeTracks(midiFile.tracks),
    ];
};

export type { IMidiFile, MidiFileFormat };
