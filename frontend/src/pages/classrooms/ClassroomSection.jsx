// frontend/src/pages/classrooms/ClassroomSection.jsx
import { Plus } from 'lucide-react';
import ClassroomTable from './ClassroomTable';

const ClassroomSection = ({ onOpenModal, onEditClass }) => {
    return (
        <div className="card theme-transition">
            <div className="card-header">
                <div className='card-header-position'>
                    <h2 className='card-header-title'>
                        Liste des classes
                    </h2>

                    {/* Bouton à droite */}
                    <button
                        onClick={onOpenModal}
                        className="btn btn-primary card-header-btn"
                    >
                        <Plus size={16} />
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
