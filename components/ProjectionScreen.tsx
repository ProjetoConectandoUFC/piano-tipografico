import React from 'react';
import { AppSettings, VisualNote, ActiveNoteInfo } from '../types';
import { Note } from './Note';

// Define a estrutura de dados (tipos) que a tela de projeção precisa receber via props
interface ProjectionScreenProps {
    visualNotes: VisualNote[];
    activeNotes: Map<string, ActiveNoteInfo>;
    settings: AppSettings;
    maxScaleAmount: number;
    noteRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
    noteOffsets: Map<number, { x: number; y: number }>;
}

// Inicia o componente que renderiza o painel principal de exibição das notas musicais
export const ProjectionScreen: React.FC<ProjectionScreenProps> = ({ 
    visualNotes, 
    activeNotes, 
    settings, 
    maxScaleAmount,
    noteRefs,
    noteOffsets,
}) => {
    return (
        // Contêiner principal da tela que aplica a cor de fundo dinâmica e esconde excessos de conteúdo
        <div
            className="absolute inset-0 transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: settings.backgroundColor }}
        >
            {/* Percorre a lista de notas visuais e renderiza cada uma na tela */}
            {visualNotes.map((note) => {
                const noteName = note.text;
                const activeInfo = activeNotes.get(noteName);
                const offset = noteOffsets.get(note.id);
                
                return (
                    // Componente individual de cada nota musical com suas propriedades e referências mapeadas
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
