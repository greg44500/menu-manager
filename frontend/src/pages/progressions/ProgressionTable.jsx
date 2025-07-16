import { useState, useEffect } from 'react';
import { useGetAllProgressionsQuery, useDeleteProgressionMutation } from '../../store/api/progressionsApi';
import { Edit3, Trash2, UserPlus } from 'lucide-react';
import AssignTeachersModal from '../../pages/progressions/AssignTeachersModal';

const ProgressionTable = ({ onEdit, refreshTrigger }) => {
    const { data, isLoading, error, refetch } = useGetAllProgressionsQuery();
    useEffect(() => {
        refetch();
    }, [refreshTrigger, refetch]);
    const [deleteProgression] = useDeleteProgressionMutation();
    const progressions = data?.data || [];

    const [selectedProgression, setSelectedProgression] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openAssignModal = (progression) => {
        setSelectedProgression(progression);
        setIsModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsModalOpen(false);
        setSelectedProgression(null);
    };

    const handleDelete = async (prog) => {
        const confirmed = window.confirm(`Supprimer la progression "${prog.title}" ?`);
        if (!confirmed) return;

        try {
            await deleteProgression(prog._id).unwrap();
            console.log('Suppression réussie');
        } catch (err) {
            console.error('Erreur de suppression', err);
            alert("Erreur lors de la suppression.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '16rem', color: 'var(--text-muted)' }}>
                <div className="loading-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
                <span className="ml-4">Chargement des progressions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <p style={{ fontWeight: '600' }}>Erreur de chargement des progressions</p>
                <p>{error.data?.message || 'Une erreur est survenue'}</p>
            </div>
        );
    }
    console.log('PROGRESSIONS', progressions);
    return (
        <div className="card theme-transition">
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px' }}>
                    <thead style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            {['Titre', 'Semaines', 'Classes', 'Formateurs', 'Actions'].map((title, idx) => (
                                <th
                                    key={idx}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        textAlign: idx === 4 ? 'right' : 'left',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        minWidth: '120px',
                                    }}
                                >
                                    {title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {progressions.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>Aucune progression enregistrée.</p>
                                </td>
                            </tr>
                        ) : (
                            progressions.map((prog) => (
                                <tr key={prog._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{prog.title}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{prog.weekNumbers?.join(', ')}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{prog.classrooms?.map(cls => cls?.name || cls?.virtualName || '[Classe inconnue]').join(', ')}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{prog.teachers?.map((t) => `${t.firstname} ${t.lastname}`).join(', ')}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="icon-button" title="Assigner formateurs" onClick={() => openAssignModal(prog)}>
                                                <UserPlus size={16} />
                                            </button>
                                            <button className="icon-button" title="Modifier" onClick={() => onEdit?.(prog)}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="icon-button" title="Supprimer" onClick={() => handleDelete(prog)}>
                                                <Trash2 size={16} />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedProgression && (
                <AssignTeachersModal
                    isOpen={isModalOpen}
                    onClose={closeAssignModal}
                    progressionId={selectedProgression._id}
                    onSuccess={refetch}
                    buttonStyle="btn btn-primary"
                    ensureArrayData={true}
                />
            )}
        </div>
    );
};

export default ProgressionTable;
