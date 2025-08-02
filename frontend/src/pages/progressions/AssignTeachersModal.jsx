// src/pages/progressions/AssignTeachersModal.jsx - VERSION AVEC PRÉ-COCHAGE
import { useEffect, useState, useMemo } from 'react';
import Modal from '../../components/common/Modal';
import { useGetTeachersOnlyQuery } from '../../store/api/usersApi';
import { useAssignTeachersMutation, useGetProgressionByIdQuery } from '../../store/api/progressionsApi';
import { ChefHat, Utensils, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * MODALE D'ASSIGNATION DE FORMATEURS - VERSION AVEC PRÉ-COCHAGE
 * 
 * CORRECTIONS :
 * - Récupère les formateurs déjà assignés à la progression
 * - Pré-coche les formateurs existants
 * - Permet d'ajouter/retirer des formateurs
 * - Affiche clairement l'état actuel vs nouveau
 */

const AssignTeachersModal = ({ isOpen, onClose, progressionId, onSuccess }) => {
    const { data: teacherApiData, isLoading: isLoadingTeachers, refetch: refetchTeachers } = useGetTeachersOnlyQuery();
    const { data: progressionData, isLoading: isLoadingProgression, refetch: refetchProgression } = useGetProgressionByIdQuery(progressionId, {
        skip: !progressionId || !isOpen
    });
    const [assignTeachers, { isLoading: isSubmitting }] = useAssignTeachersMutation();


    console.log("🎓 Formateurs chargés :", teacherApiData)

    // États séparés pour chaque spécialisation
    const [selectedCuisine, setSelectedCuisine] = useState([]);
    const [selectedService, setSelectedService] = useState([]);
    const [initialCuisine, setInitialCuisine] = useState([]);
    const [initialService, setInitialService] = useState([]);

    // Préparation des données par spécialisation
    const teachersBySpecialization = useMemo(() => {
        const allTeachers = teacherApiData?.teachers || [];

        const sortTeachers = (teachers) =>
            teachers.sort((a, b) => {
                const nameA = `${a.lastname} ${a.firstname}`.toLowerCase();
                const nameB = `${b.lastname} ${b.firstname}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });

        return {
            cuisine: sortTeachers(allTeachers.filter(t => t.specialization === 'cuisine')),
            service: sortTeachers(allTeachers.filter(t => t.specialization === 'service')),
        };
    }, [teacherApiData]);
    // REFETCH DES UTILISATEURS AVEC ISTEACHER:TRUE
    useEffect(() => {
        if (isOpen) {
            refetchTeachers()
        }
    }, [isOpen, refetchTeachers])

    // PRÉ-COCHAGE DES FORMATEURS EXISTANTS
    useEffect(() => {
        if (progressionData && isOpen) {
            const existingTeachers = progressionData.teachers || [];

            const cuisineIds = existingTeachers
                .filter(t => t.specialization === 'cuisine')
                .map(t => t._id);

            const serviceIds = existingTeachers
                .filter(t => t.specialization === 'service')
                .map(t => t._id);

            setSelectedCuisine(cuisineIds);
            setSelectedService(serviceIds);
            setInitialCuisine(cuisineIds);
            setInitialService(serviceIds);
        }
    }, [progressionData, isOpen]);

    // Gestion des sélections
    const toggleCuisineTeacher = (id) => {
        setSelectedCuisine(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const toggleServiceTeacher = (id) => {
        setSelectedService(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    // Soumission
    const handleSubmit = async () => {
        const allSelectedTeachers = [...selectedCuisine, ...selectedService];

        try {
            await assignTeachers({
                id: progressionId,
                teachers: allSelectedTeachers
            }).unwrap();
            await refetchProgression(); // <- récupère les données mises à jour
            // 🧠 Mise à jour des états internes
            setInitialCuisine([...selectedCuisine]);
            setInitialService([...selectedService]);

            const totalInitial = initialCuisine.length + initialService.length;
            const totalFinal = allSelectedTeachers.length;

            if (totalFinal === 0) {
                toast.success('Tous les formateurs ont été désassignés');
            } else if (totalInitial === 0) {
                toast.success(`${totalFinal} formateur${totalFinal > 1 ? 's' : ''} assigné${totalFinal > 1 ? 's' : ''}`);
            } else {
                toast.success(`Assignation mise à jour : ${totalFinal} formateur${totalFinal > 1 ? 's' : ''}`);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Erreur assignation formateurs :', err);
            toast.error(err?.data?.message || 'Erreur lors de l\'assignation');
        }
    };

    // Reset des sélections à la fermeture
    useEffect(() => {
        if (progressionData && isOpen) {
            const existingTeachers = progressionData.teachers || [];

            const cuisineIds = existingTeachers
                .filter(t => t.specialization === 'cuisine')
                .map(t => t._id);

            const serviceIds = existingTeachers
                .filter(t => t.specialization === 'service')
                .map(t => t._id);

            setSelectedCuisine(cuisineIds);
            setSelectedService(serviceIds);
            setInitialCuisine(cuisineIds);
            setInitialService(serviceIds);

            console.log("🎯 Rechargement des assignations depuis progression", existingTeachers);
        }
    }, [progressionData, isOpen]);


    // Calculs pour le tableau de synthèse
    const totalSelected = selectedCuisine.length + selectedService.length;
    const totalInitial = initialCuisine.length + initialService.length;
    const selectedCuisineTeachers = teachersBySpecialization.cuisine.filter(t => selectedCuisine.includes(t._id));
    const selectedServiceTeachers = teachersBySpecialization.service.filter(t => selectedService.includes(t._id));

    // Détection des changements
    const hasChanges =
        JSON.stringify([...selectedCuisine].sort()) !== JSON.stringify([...initialCuisine].sort()) ||
        JSON.stringify([...selectedService].sort()) !== JSON.stringify([...initialService].sort());

    const isLoading = isLoadingTeachers || isLoadingProgression;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assigner des formateurs"
        >
            <form className="form-container" style={{ maxWidth: 700, minWidth: 340 }}>
                {/* Etat actuel au-dessus, sur toute la largeur */}
                {totalInitial > 0 && (
                    <div className="card card-summary mb-4" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info)' }}>
                        <div className="card-content-form">
                            <div className="summary-header">
                                <Users size={16} style={{ color: 'var(--info)' }} />
                                <h4 className="card-title-form" style={{ color: 'var(--info)' }}>
                                    Formateurs actuellement assignés
                                </h4>
                                <span className="badge badge-info">
                                    {totalInitial} formateur{totalInitial > 1 ? 's' : ''}
                                </span>
                            </div>
                            <p className="field-help" style={{ color: 'var(--info)' }}>
                                Cuisine : {initialCuisine.length} &nbsp;•&nbsp; Service : {initialService.length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Grille 2 colonnes pour Cuisine/Service */}
                <div className='form-container-2col'>
                    {/* CUISINE */}
                    <div className="form-group">
                        <label className="label label-icon">
                            <ChefHat size={18} />
                            <span>Formateurs Cuisine</span>
                            {selectedCuisine.length > 0 && (
                                <span className="badge badge-warning" style={{ marginLeft: 8 }}>
                                    {selectedCuisine.length} sélectionné{selectedCuisine.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </label>
                        <div className="teacher-list">
                            {isLoading ? (
                                <div className="loading-container"><div className="loading-spinner" /><span>Chargement...</span></div>
                            ) : teachersBySpecialization.cuisine.length === 0 ? (
                                <p className="empty-state">Aucun formateur cuisine</p>
                            ) : (
                                <div className="teacher-grid">
                                    {teachersBySpecialization.cuisine.map(teacher => {
                                        const isSelected = selectedCuisine.includes(teacher._id);
                                        const wasInitiallySelected = initialCuisine.includes(teacher._id);
                                        return (
                                            <label
                                                key={teacher._id}
                                                className={`teacher-item ${isSelected ? 'teacher-item-selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleCuisineTeacher(teacher._id)}
                                                    className="teacher-checkbox"
                                                />
                                                <span className="teacher-name">
                                                    {teacher.lastname} {teacher.firstname}
                                                    {wasInitiallySelected &&
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--info)',
                                                            marginLeft: '0.5rem'
                                                        }}>(déjà assigné)</span>
                                                    }
                                                </span>
                                                {isSelected && <Check size={14} className="teacher-check" />}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p className="field-help">
                            {teachersBySpecialization.cuisine.length} formateur{teachersBySpecialization.cuisine.length > 1 ? 's' : ''} disponible{teachersBySpecialization.cuisine.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    {/* SERVICE */}
                    <div className="form-group">
                        <label className="label label-icon">
                            <Utensils size={18} />
                            <span>Formateurs Service</span>
                            {selectedService.length > 0 && (
                                <span className="badge badge-info" style={{ marginLeft: 8 }}>
                                    {selectedService.length} sélectionné{selectedService.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </label>
                        <div className="teacher-list">
                            {isLoading ? (
                                <div className="loading-container"><div className="loading-spinner" /><span>Chargement...</span></div>
                            ) : teachersBySpecialization.service.length === 0 ? (
                                <p className="empty-state">Aucun formateur service</p>
                            ) : (
                                <div className="teacher-grid">
                                    {teachersBySpecialization.service.map(teacher => {
                                        const isSelected = selectedService.includes(teacher._id);
                                        const wasInitiallySelected = initialService.includes(teacher._id);
                                        return (
                                            <label
                                                key={teacher._id}
                                                className={`teacher-item ${isSelected ? 'teacher-item-selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleServiceTeacher(teacher._id)}
                                                    className="teacher-checkbox"
                                                />
                                                <span className="teacher-name">
                                                    {teacher.lastname} {teacher.firstname}
                                                    {wasInitiallySelected &&
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--info)',
                                                            marginLeft: '0.5rem'
                                                        }}>(déjà assigné)</span>
                                                    }
                                                </span>
                                                {isSelected && <Check size={14} className="teacher-check" />}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p className="field-help">
                            {teachersBySpecialization.service.length} formateur{teachersBySpecialization.service.length > 1 ? 's' : ''} disponible{teachersBySpecialization.service.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Synthèse équipe, sous la grille, toute la largeur */}
                {totalSelected > 0 && (
                    <div className="card card-summary">
                        <div className="card-content-form">
                            <div className="summary-header">
                                <Users size={16} />
                                <h4 className="card-title-form">
                                    {hasChanges ? 'Nouvelle équipe' : 'Équipe actuelle'}
                                </h4>
                                <span className="badge badge-primary">
                                    {totalSelected} formateur{totalSelected > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="summary-grid">
                                {/* Résumé cuisine */}
                                <div className="summary-section">
                                    <div className="summary-section-header">
                                        <ChefHat size={14} />
                                        <span className="summary-section-title">
                                            Cuisine ({selectedCuisine.length})
                                        </span>
                                    </div>
                                    {selectedCuisineTeachers.length === 0
                                        ? <p className="summary-empty">Aucun</p>
                                        : <ul className="summary-list">
                                            {selectedCuisineTeachers.map(teacher => (
                                                <li key={teacher._id}>
                                                    {teacher.firstname} {teacher.lastname}
                                                </li>
                                            ))}
                                        </ul>
                                    }
                                </div>
                                {/* Résumé service */}
                                <div className="summary-section">
                                    <div className="summary-section-header">
                                        <Utensils size={14} />
                                        <span className="summary-section-title">
                                            Service ({selectedService.length})
                                        </span>
                                    </div>
                                    {selectedServiceTeachers.length === 0
                                        ? <p className="summary-empty">Aucun</p>
                                        : <ul className="summary-list">
                                            {selectedServiceTeachers.map(teacher => (
                                                <li key={teacher._id}>
                                                    {teacher.firstname} {teacher.lastname}
                                                </li>
                                            ))}
                                        </ul>
                                    }
                                </div>
                            </div>
                            {/* Indication des changements */}
                            {hasChanges && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--warning-bg)',
                                    border: '1px solid var(--warning)',
                                    borderRadius: '0.375rem'
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        color: 'var(--warning)',
                                        fontWeight: '500'
                                    }}>
                                        ⚠️ Modifications détectées par rapport à l'assignation actuelle
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions alignées bas droite */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn badge-secondary"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                        disabled={isSubmitting || !hasChanges}
                    >
                        {isSubmitting ? 'Assignation...' :
                            !hasChanges ? 'Aucun changement' :
                                `Assigner ${totalSelected} formateur${totalSelected > 1 ? 's' : ''}`}
                    </button>
                </div>
            </form>
        </Modal>

    );
};

export default AssignTeachersModal;