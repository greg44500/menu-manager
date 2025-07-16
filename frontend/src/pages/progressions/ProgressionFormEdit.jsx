// ✅ ProgressionFormEdit.jsx - Évite d'écraser les enseignants si absents
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useUpdateProgressionMutation, useGetProgressionByIdQuery } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import toast from 'react-hot-toast';
import { ChefHat, Utensils, Users } from 'lucide-react';

const ProgressionFormEdit = ({ progression, onSuccess, onClose }) => {
    const [assignedTeachers, setAssignedTeachers] = useState([])
    const [updateProgression, { isLoading }] = useUpdateProgressionMutation();
    const { data: classroomsData } = useGetAllClassroomsQuery();
    const { data: progressionRefreshed, refetch } = useGetProgressionByIdQuery(progression._id, { skip: !progression?._id });



    const classrooms = useMemo(() => classroomsData?.classrooms || [], [classroomsData]);

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(progressionSchema),
        defaultValues: {
            title: '',
            classrooms: [],
            weekNumbers: []
        }
    });

    const selectedClassrooms = watch('classrooms');

    useEffect(() => {
        if (progression && classrooms.length > 0) {
            console.log('RESET DATA FROM progression:', progression);
            reset({
                title: progression.title || '',
                classrooms: progression.classrooms?.map(c => c._id) || [],
                weekNumbers: progression.weekNumbers || []
            });
        }
    }, [progression, classrooms, reset]);

    useEffect(() => {
        if (progressionRefreshed?.teachers?.length) {
            setAssignedTeachers(progressionRefreshed.teachers);
            console.log("👤 Mise à jour formateurs depuis progressionRefreshed", progressionRefreshed.teachers);
        }
    }, [progressionRefreshed?.teachers]);

    const handleCheckboxChange = (e) => {
        const selected = new Set(getValues('classrooms'));
        if (e.target.checked) selected.add(e.target.value);
        else selected.delete(e.target.value);
        setValue('classrooms', Array.from(selected));
    };

    const onSubmit = async (data) => {
        try {
            console.log('Form data soumis:', data);
            console.log('progressionRefreshed:', progressionRefreshed);

            const progressionId = progression?._id || progressionRefreshed?._id;
            if (!progressionId) {
                toast.error("ID progression manquant.");
                return;
            }

            const classIds = Array.isArray(data.classrooms)
                ? data.classrooms.map(id => id.toString())
                : [];

            const submissionData = {
                title: data.title,
                classrooms: classIds,
                weekNumbers: data.weekNumbers,
            };

            const teacherIds = assignedTeachers.map(t => t._id);
            if (teacherIds && teacherIds.length > 0) {
                submissionData.teachers = teacherIds;
            }

            console.log('Données envoyées à updateProgression:', submissionData);

            await updateProgression({ id: progressionId, ...submissionData }).unwrap();
            toast.success('Progression modifiée avec succès !');
            await refetch();
            onSuccess?.();

        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la modification');
        }
    };

    const assignedCuisine = assignedTeachers.filter(t => t.specialization === 'cuisine');
    const assignedService = assignedTeachers.filter(t => t.specialization === 'service');
    console.log("👀 Teachers affichés (visuel)", progressionRefreshed?.teachers);
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            {/* Titre */}
            <div className="form-group">
                <label className="label label-required">Titre de la progression</label>
                <input {...register("title")} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Ex: BP AC 2 2028" />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            {/* Classes avec checkbox scrollable */}
            <div className="form-group">
                <label className="label label-required label-icon">
                    <Users size={16} className="text-muted" />
                    <span>Classes assignées</span>
                </label>
                <div className="scroll-box bg-gray-50 border border-gray-200 rounded-md max-h-48 overflow-y-auto p-2">
                    {classrooms.map(c => (
                        <label key={c._id} className="checkbox-item block">
                            <input
                                type="checkbox"
                                value={c._id}
                                checked={selectedClassrooms.includes(c._id)}
                                onChange={handleCheckboxChange}
                            />
                            <span className="ml-2">{c.name || c.virtualName || `Classe ${c._id}`}</span>
                        </label>
                    ))}
                </div>
                {errors.classrooms && <p className="form-error">{errors.classrooms.message}</p>}
            </div>

            {/* Semaines */}
            <div className="form-group">
                <label className="label label-required">Semaines concernées</label>
                <input type="text" {...register('weekNumbers')} className={`input ${errors.weekNumbers ? 'input-error' : ''}`} placeholder="Ex: 1,2,3,5" />
                {errors.weekNumbers && <p className="form-error">{errors.weekNumbers.message}</p>}
            </div>

            {/* Visuel Formateurs */}
            <div className="card card-summary">
                <div className="card-content-form">
                    <div className="summary-grid">
                        <div className="summary-section">
                            <div className="summary-section-header">
                                <ChefHat size={16} />
                                <span className="summary-section-title">Formateurs Cuisine</span>
                            </div>
                            <ul className="summary-list">
                                {assignedCuisine.length > 0 ? assignedCuisine.map(t => (
                                    <li key={t._id}>{t.lastname} {t.firstname}</li>
                                )) : <p className="summary-empty">Aucun formateur cuisine assigné</p>}
                            </ul>
                        </div>

                        <div className="summary-section">
                            <div className="summary-section-header">
                                <Utensils size={16} />
                                <span className="summary-section-title">Formateurs Service</span>
                            </div>
                            <ul className="summary-list">
                                {assignedService.length > 0 ? assignedService.map(t => (
                                    <li key={t._id}>{t.lastname} {t.firstname}</li>
                                )) : <p className="summary-empty">Aucun formateur service assigné</p>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>Mettre à jour</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
};

export default ProgressionFormEdit;
