
export const requestMidiAccess = async (): Promise<MIDIAccess> => {
    if (!navigator.requestMIDIAccess) {
        throw new Error('Web MIDI API is not supported in this browser.');
    }
    return navigator.requestMIDIAccess();
};

export const listenToMidiDevice = (
    deviceId: string,
    midiAccess: MIDIAccess,
    onNoteOn: (note: number, velocity: number) => void,
    onNoteOff: (note: number, velocity: number) => void,
    onControlChange: (controller: number, value: number) => void
): (() => void) => {
    const input = midiAccess.inputs.get(deviceId);

    if (!input) {
        console.warn(`MIDI device with id ${deviceId} not found.`);
        return () => {};
    }

    const onMidiMessage = (event: MIDIMessageEvent) => {
        const [command, note, velocity] = event.data;

        // Note on
        if (command === 144 && velocity > 0) {
            onNoteOn(note, velocity);
        } 
        // Note off (or note on with velocity 0)
        else if (command === 128 || (command === 144 && velocity === 0)) {
            onNoteOff(note, velocity);
        }
        // Control Change
        else if (command >= 176 && command <= 191) {
            onControlChange(note, velocity);
        }
    };

    input.addEventListener('midimessage', onMidiMessage);

    // Return a cleanup function
    return () => {
        input.removeEventListener('midimessage', onMidiMessage);
    };
};
