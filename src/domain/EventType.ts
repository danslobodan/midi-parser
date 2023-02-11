export enum EventType {
    NOTE_OFF = 0x8,
    NOTE_ON = 0x9,
    NOTE_AFTERTOUCH = 0xa,
    CONTROLLER = 0xb,
    PROGRAM_CHANGE = 0xc,
    CHANNEL_AFTERTOUCH = 0xd,
    PITCH_BEND_EVENT = 0xe,
    SYSTEM_EXCLUSIVE_EVENT = 0xf,
    META_EVENT_TYPE = 0xff,
    END_OF_FILE = -1,
}
