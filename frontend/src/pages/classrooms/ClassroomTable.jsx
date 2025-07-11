// frontend/src/pages/classrooms/ClassroomTable.jsx
import { useGetAllClassroomsQuery, useDeleteClassroomMutation } from '@/store/api/classroomsApi';
import { Trash2, Edit3, School } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ClassroomTable = ({ onEdit }) => {
    const { data, isLoading, error, refetch } = useGetAllClassroomsQuery();
    const [deleteClassroom] = useDeleteClassroomMutation();
    const [page, setPage] = useState(1);
    const perPage = 10;

    const handleDelete = async (id) => {
        if (!window.confirm('Confirmer la suppression de la classe ?')) return;
        try {
            await deleteClassroom(id).unwrap();
            toast.success('Classe supprimée');
            refetch();
        } catch (err) {
            toast.error('Erreur lors de la suppression');
            console.log(err)
        }
    };

    const classrooms = data?.classrooms || [];
    const totalPages = Math.ceil(classrooms.length / perPage);
    const paginated = classrooms.slice((page - 1) * perPage, page * perPage);

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '16rem', color: 'var(--text-muted)' }}>
                <div className="loading-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
                <span className="ml-4">Chargement des classes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <p style={{ fontWeight: '600' }}>Erreur de chargement des classes</p>
                <p>{error.data?.message || 'Une erreur est survenue'}</p>
            </div>
        );
    }

    return (
        <div className="card theme-transition">
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px' }}>
                    <thead style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            {['Nom', 'Diplôme', 'Catégorie', 'Année', 'Groupe', 'Formateur', 'Actions'].map((title, idx) => (
                                <th key={idx} style={{
                                    padding: '1rem 1.5rem',
                                    textAlign: idx === 6 ? 'right' : 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    minWidth: '120px'
                                }}>{title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                    <div className="flex-center" style={{ flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: '50%' }}>
                                            <School size={32} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Aucune classe</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Commencez par en créer une</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : paginated.map((c) => (
                            <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{c.virtualName}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>{c.diploma || '-'}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>{c.category || '-'}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>{c.certificationSession || '-'}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>{c.group || '-'}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {c.assignedTeachers?.[0]
                                        ? `${c.assignedTeachers[0].firstname} ${c.assignedTeachers[0].lastname}`
                                        : '-'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="icon-button"
                                            title="Modifier"

                                            onClick={() => onEdit(c)}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            title="Supprimer"
                                            className="icon-button"
                                            onClick={() => handleDelete(c._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`px-3 py-1 rounded-md text-sm border font-medium ${i + 1 === page ? 'bg-primary text-white' : 'bg-white text-foreground'}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomTable;
