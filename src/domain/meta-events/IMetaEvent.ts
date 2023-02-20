import { IMidiEvent } from "../IMidiEvent";

export enum MetaEventType {
    TEXT_EVENT = 0x01,
    COPYRIGHT_NOTICE = 0x02,
    TRACK_NAME = 0x03,
    INSTRUMENT_NAME = 0x04,
    LYRICS = 0x05,
    MARKER = 0x06,
    CUE_POINT = 0x07,
    MIDI_CHANNEL_PREFIX = 0x20,
    MIDI_PORT = 0x21,
    END_OF_TRACK = 0x2f,
    SET_TEMPO = 0x51,
    SMPTE_OFFSET = 0x54,
    TIME_SIGNATURE = 0x58,
    KEY_SIGNATURE = 0x59,
}

export interface IMetaEvent extends IMidiEvent {
    metaType: MetaEventType;
    length: number;
}
