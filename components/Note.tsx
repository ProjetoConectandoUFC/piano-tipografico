
import React from 'react';
import { VisualNote, ActiveNoteInfo, AppSettings } from '../types';
import { RELEASE_FADE_SECONDS } from '../constants';

interface NoteProps {
    note: VisualNote;
    isActive: boolean;
    activeInfo: ActiveNoteInfo | undefined;
    settings: AppSettings;
    maxScaleAmount: number;
    offset?: { x: number; y: number };
    onRef: (el: HTMLDivElement | null) => void;
}

export const Note: React.FC<NoteProps> = React.memo(({ note, isActive, activeInfo, settings, maxScaleAmount, offset, onRef }) => {
    const intensity = (activeInfo?.velocity ?? 0) / 127;
    const scale = isActive ? 1 + (maxScaleAmount - 1) * intensity : 1;
    const color = isActive && activeInfo ? activeInfo.color : settings.textColor;

    const style: React.CSSProperties = {
        position: 'absolute',
        top: note.position.top,
        left: note.position.left,
        fontFamily: settings.fontFamily,
        fontSize: `${note.fontSize}vw`,
        color: color,
        transform: `translate(calc(-50% + ${offset?.x ?? 0}px), calc(-50% + ${offset?.y ?? 0}px)) rotate(${note.rotation}deg) scale(${scale})`,
        transition: `transform 0.2s ease-out, color ${RELEASE_FADE_SECONDS}s ease-out`,
        userSelect: 'none',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        willChange: 'transform, color, z-index',
        zIndex: isActive ? 10 : 1,
    };
    
    // When becoming active, we want a faster attack transition
    if (isActive) {
        style.transition = 'transform 0.05s ease-out, color 0.05s ease-out';
    }

    return (
        <div style={style} ref={onRef}>
            {note.text}
        </div>
    );
});
