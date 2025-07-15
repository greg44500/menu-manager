// frontend/src/pages/classrooms/ClassroomSection.jsx
<<<<<<< HEAD
import { PlusCircle } from 'lucide-react';
=======
import { Plus } from 'lucide-react';
>>>>>>> d7c9253 (Progression CRUD step 1, bugs fixed, userform re-design)
import ClassroomTable from './ClassroomTable';

const ClassroomSection = ({ onOpenModal, onEditClass }) => {
    return (
        <div className="card theme-transition">
            <div className="card-header">
<<<<<<< HEAD
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
=======
                <div className='card-header-position'>
                    <h2 className='card-header-title'>
>>>>>>> d7c9253 (Progression CRUD step 1, bugs fixed, userform re-design)
                        Liste des classes
                    </h2>

                    {/* Bouton à droite */}
                    <button
                        onClick={onOpenModal}
<<<<<<< HEAD
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
=======
                        className="btn btn-primary card-header-btn"
                    >
                        <Plus size={16} />
>>>>>>> d7c9253 (Progression CRUD step 1, bugs fixed, userform re-design)
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
