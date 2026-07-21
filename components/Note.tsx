import React from 'react';
import { VisualNote, ActiveNoteInfo, AppSettings } from '../types';
import { RELEASE_FADE_SECONDS } from '../constants';

// Define a estrutura de dados (tipos) que o componente Note precisa receber via props
interface NoteProps {
    note: VisualNote;
    isActive: boolean;
    activeInfo: ActiveNoteInfo | undefined;
    settings: AppSettings;
    maxScaleAmount: number;
    offset?: { x: number; y: number };
    onRef: (el: HTMLDivElement | null) => void;
}

// Inicia o componente memorizado (React.memo) para evitar re-renderizações desnecessárias e otimizar a performance
export const Note: React.FC<NoteProps> = React.memo(({ note, isActive, activeInfo, settings, maxScaleAmount, offset, onRef }) => {
