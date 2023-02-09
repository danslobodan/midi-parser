interface MidiFile {
    header: MidiHeader;
}

enum MidiFileFormat {
    SingleTrack = 0,
    MultiTrackSync = 1,
    MultiTrackAsync = 2,
}

interface MidiHeader {
    // must be 0x4d546864
    midiIdentifier: number;
    headerSize: number;
    fileFormat: MidiFileFormat;
    numberOfTracks: number;
    timeDivision: number;
}

export type { MidiFile, MidiFileFormat };
