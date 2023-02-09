interface MidiEvent {
    deltaTime: number;
    statusByte: number;
    dataByte1: number;
    dataByte2: number;
}

interface MidiEventInterpreted {
    deltaTime: number;
    type: string;
    channel: number;
}
