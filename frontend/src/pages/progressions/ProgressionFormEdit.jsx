import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useUpdateProgressionMutation, useGetProgressionByIdQuery } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import toast from 'react-hot-toast';
import { ChefHat, Utensils, Users, Check } from 'lucide-react';

const ProgressionFormEdit = ({ progression, onSuccess, onClose }) => {
    const [assignedTeachers, setAssignedTeachers] = useState([])
    const [weekInput, setWeekInput] = useState('');

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
            reset({
                title: progression.title || '',
                classrooms: progression.classrooms?.map(c => c._id) || [],
                weekNumbers: progression.weekNumbers || []
            });
            setWeekInput(Array.isArray(progression.weekNumbers) ? progression.weekNumbers.join(',') : '');
        }
    }, [progression, classrooms, reset]);

    useEffect(() => {
        if (progressionRefreshed?.teachers?.length) {
            setAssignedTeachers(progressionRefreshed.teachers);
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
            const progressionId = progression?._id || progressionRefreshed?._id;
            if (!progressionId) {
                toast.error("ID progression manquant.");
                return;
            }

            const classIds = Array.isArray(data.classrooms)
                ? data.classrooms.map(id => id.toString())
                : [];

            const parsedWeeks = weekInput
                .split(',')
                .map(s => parseInt(s.trim(), 10))
                .filter(n => !isNaN(n));

            const submissionData = {
                title: data.title,
                classrooms: classIds,
                weekNumbers: parsedWeeks,
            };

            const teacherIds = assignedTeachers.map(t => t._id);
            if (teacherIds.length > 0) {
                submissionData.teachers = teacherIds;
            }

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            <div className="form-group">
                <label className="label label-required">Titre de la progression</label>
                <input {...register("title")} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Ex: BP AC 2 2028" />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div className="form-group">
                <label className="label label-required label-icon">
                    <Users size={16} className="text-muted" />
                    <span>Classes assignées</span>
                    {selectedClassrooms.length > 0 && (
                        <span className="badge badge-primary">
                            {selectedClassrooms.length} sélectionnée{selectedClassrooms.length > 1 ? 's' : ''}
                        </span>
                    )}
                </label>

                <div className="teacher-list">
                    {classrooms.length === 0 ? (
                        <p className="empty-state">Aucune classe disponible</p>
                    ) : (
                        <div className="teacher-grid">
                            {classrooms.map(c => {
                                const isSelected = selectedClassrooms.includes(c._id)
                                return (
                                    <label
                                        key={c._id}
                                        className={`teacher-item ${isSelected ? 'teacher-item-selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleCheckboxChange(e)}
                                            value={c._id}
                                            className="teacher-checkbox"
                                        />
                                        <span className="teacher-name">{c.name || c.virtualName}</span>
                                        {isSelected && <Check size={14} className="teacher-check" />}
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>
                <p className="field-help">{classrooms.length} classe{classrooms.length > 1 ? 's' : ''} disponible{classrooms.length > 1 ? 's' : ''}</p>
                {errors.classrooms && <p className="form-error">{errors.classrooms.message}</p>}
            </div>


            <div className="form-group">
                <label className="label label-required">Semaines concernées</label>
                <input
                    type="text"
                    value={weekInput}
                    onChange={(e) => setWeekInput(e.target.value)}
                    className={`input ${errors.weekNumbers ? 'input-error' : ''}`}
                    placeholder="Ex: 1,2,3,5"
                />
                {errors.weekNumbers && <p className="form-error">{errors.weekNumbers.message}</p>}
            </div>

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

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>Mettre à jour</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
};

export default ProgressionFormEdit;