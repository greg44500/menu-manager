// frontend/src/pages/classrooms/ClassroomSection.jsx
import { PlusCircle } from 'lucide-react';
import ClassroomTable from './ClassroomTable';

const ClassroomSection = ({ onOpenModal, onEditClass }) => {
    return (
        <div className="card theme-transition">
            <div className="card-header">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    {/* Titre à gauche */}
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: 0
                    }}>
                        Liste des classes
                    </h2>

                    {/* Bouton à droite */}
                    <button
                        onClick={onOpenModal}
                        className="btn btn-primary"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <PlusCircle size={16} />
                        Ajouter une Classe
                    </button>
                </div>
            </div>
            <div className="card-content">
                <ClassroomTable onEdit={onEditClass} />
            </div>
        </div>
    );
};

export default ClassroomSection;
