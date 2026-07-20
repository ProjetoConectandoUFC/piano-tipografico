
import React from 'react';
import { AppSettings, VisualNote, ActiveNoteInfo } from '../types';
import { Note } from './Note';

interface ProjectionScreenProps {
    visualNotes: VisualNote[];
    activeNotes: Map<string, ActiveNoteInfo>;
    settings: AppSettings;
    maxScaleAmount: number;
    noteRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
    noteOffsets: Map<number, { x: number; y: number }>;
}

export const ProjectionScreen: React.FC<ProjectionScreenProps> = ({ 
    visualNotes, 
    activeNotes, 
    settings, 
    maxScaleAmount,
    noteRefs,
    noteOffsets,
}) => {
    return (
        <div
            className="absolute inset-0 transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: settings.backgroundColor }}
        >
            {visualNotes.map((note) => {
                const noteName = note.text;
                const activeInfo = activeNotes.get(noteName);
                const offset = noteOffsets.get(note.id);
                
                return (
                    <Note 
                        key={note.id}
                        note={note}
                        isActive={!!activeInfo}
                        activeInfo={activeInfo}
                        settings={settings}
                        maxScaleAmount={maxScaleAmount}
                        offset={offset}
                        onRef={(el) => {
                            if (el) {
                                noteRefs.current.set(note.id, el);
                            } else {
                                noteRefs.current.delete(note.id);
                            }
                        }}
                    />
                );
            })}
        </div>
    );
};
