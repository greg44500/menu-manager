import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useUpdateProgressionMutation, useGetProgressionByIdQuery } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getWeeksOfSession } from '../../utils/weeks';

const ProgressionFormEdit = ({ progression, onSuccess, onClose }) => {
    // RTK QUERY: Update progression
    const [updateProgression, { isLoading }] = useUpdateProgressionMutation();

    // RTK QUERY: Get all classrooms
    const { data: classroomsData } = useGetAllClassroomsQuery();
    const classrooms = useMemo(() => classroomsData?.classrooms || [], [classroomsData]);

    // RTK QUERY: Refresh progression (for teacher updates, if needed)
    const { data: progressionRefreshed, refetch } = useGetProgressionByIdQuery(progression._id, { skip: !progression?._id });

    // Redux: ID du calendrier actif
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);

    // RTK Query : Récupération des calendars (sessions)
    const { data: calendarsData } = useGetAllCalendarsQuery();
    const calendars = calendarsData?.calendars || [];

    // Sélection de l'objet calendar actif
    const activeCalendar = calendars.find(c => c._id === activeCalendarId);

    // Génération dynamique des semaines disponibles selon la session
    const availableWeeks = useMemo(() => {
        if (!activeCalendar?.startDate || !activeCalendar?.endDate) return [];
        return getWeeksOfSession(
            new Date(activeCalendar.startDate),
            new Date(activeCalendar.endDate)
        );
    }, [activeCalendar?.startDate, activeCalendar?.endDate]);

    // HOOK FORM: initialisation et validation
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(progressionSchema),
        defaultValues: {
            title: '',
            classrooms: [],
            weeks: [],
        }
    });

    // Effet: initialise le formulaire à l'ouverture ou update progression
    useEffect(() => {
        if (progression && classrooms.length > 0) {
            reset({
                title: progression.title || '',
                classrooms: progression.classrooms?.map(c => c._id) || [],
                weeks: progression.weekList
                    ? progression.weekList.map(w => JSON.stringify({ weekNumber: w.weekNumber, year: w.year }))
                    : [],
            });
        }
    }, [progression, classrooms, reset]);

    // Pour badge classes sélectionnées
    const selectedClassrooms = watch('classrooms') || [];

    // Soumission du formulaire (mise à jour progression)
    const onSubmit = async (data) => {
        const progressionId = progression?._id || progressionRefreshed?._id;
        if (!progressionId) {
            toast.error("ID progression manquant.");
            return;
        }
        // Transforme la sélection des semaines (JSON.parse chaque valeur)
        let weekList = [];
        if (Array.isArray(data.weeks)) {
            weekList = data.weeks.map(w => {
                try {
                    return JSON.parse(w);
                } catch {
                    return null;
                }
            }).filter(Boolean);
        }
        const currentTeachers = (progression?.teachers || []).map(t => (typeof t === 'object' ? t._id : t));
        const submissionData = {
            title: data.title,
            classrooms: Array.isArray(data.classrooms) ? data.classrooms : [],
            weekList,
            teachers: currentTeachers,
        };
        try {
            await updateProgression({ id: progressionId, ...submissionData }).unwrap();
            toast.success('Progression modifiée avec succès !');
            await refetch();
            onSuccess?.();
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la modification');
        }
    };

    // ---------- UI : même disposition 2 colonnes que la création ----------
    return (
        <form className='form-container' onSubmit={handleSubmit(onSubmit)}>
            {/* Bloc info */}
            <div className="card card-summary mb-4">
                <div className="card-content-form">
                    L’assignation des formateurs se fait après la création de la progression.
                </div>
            </div>

            {/* Titre (toujours en haut) */}
            <div className="form-group">
                <label className="label label-required">Titre de la progression</label>
                <input
                    {...register("title")}
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ex: BP AC 2 2028"
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            {/* Grille 2 colonnes responsive */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* COLONNE 1 : Classes */}
                <div>
                    <label className="label label-required">
                        Classes assignées
                        {selectedClassrooms.length > 0 && (
                            <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                                {selectedClassrooms.length} sélectionnée{selectedClassrooms.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </label>
                    <div className="teacher-list">
                        {classrooms.map(cls => (
                            <label key={cls._id} style={{ display: 'block', marginBottom: 6 }}>
                                <input
                                    type="checkbox"
                                    value={cls._id}
                                    {...register('classrooms')}
                                    style={{ marginRight: 8 }}
                                />
                                {cls.name || cls.virtualName}
                            </label>
                        ))}
                    </div>
                    {errors.classrooms && (
                        <p className="form-error">{errors.classrooms.message}</p>
                    )}
                    <p className="field-help">
                        Sélection multiple possible.
                    </p>
                </div>

                {/* COLONNE 2 : Semaines */}
                <div>
                    <label className="label label-required">
                        Semaines de présence en centre (selon session)
                    </label>
                    <div className="teacher-list">
                        {availableWeeks.map(w => {
                            const valueStr = JSON.stringify({ weekNumber: w.weekNumber, year: w.year });
                            return (
                                <label key={valueStr} style={{ display: 'block', marginBottom: 6 }}>
                                    <input
                                        type="checkbox"
                                        value={valueStr}
                                        {...register('weeks')}
                                        style={{ marginRight: 8 }}
                                    />
                                    Semaine {w.weekNumber} ({w.year}) - {w.date.toLocaleDateString('fr-FR')}
                                </label>
                            );
                        })}
                    </div>
                    {errors.weeks && (
                        <p className="form-error">{errors.weeks.message}</p>
                    )}
                    <p className="field-help">
                        Les semaines disponibles sont celles de la session sélectionnée.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-muted" onClick={onClose}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>Mettre à jour</button>
            </div>
        </form>
    );
};

export default ProgressionFormEdit;
