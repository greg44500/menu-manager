// src/pages/progressions/ProgressionForm.jsx

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useCreateProgressionMutation } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi';
import toast from 'react-hot-toast';
import { getWeeksOfSession } from '../../utils/weeks';

const ProgressionForm = ({ onSuccess, onClose }) => {
    // RTK Query : Mutation création progression
    const [createProgression, { isLoading }] = useCreateProgressionMutation();

    // RTK Query : Récupération des classes
    const { data: classroomsData } = useGetAllClassroomsQuery();
    const classrooms = useMemo(() => classroomsData?.classrooms || [], [classroomsData]);

    // RTK Query : Récupération des calendars (sessions)
    const { data: calendarsData } = useGetAllCalendarsQuery();
    const calendars = calendarsData?.calendars || [];
    console.log('calendars', calendars);
    // Récupère l’ID du calendar actif depuis Redux
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);
    console.log("SESSION ACTIVE", activeCalendarId)

    // Recherche l’objet calendar actif dans la liste
    const activeCalendar = calendars.find(c => c._id === activeCalendarId);
    console.log('activeCalendar', activeCalendar);
    // Génère dynamiquement la liste des semaines disponibles pour la session active
    const availableWeeks = useMemo(() => {
        if (!activeCalendar?.startDate || !activeCalendar?.endDate) return [];
        return getWeeksOfSession(
            new Date(activeCalendar.startDate),
            new Date(activeCalendar.endDate)
        );
    }, [activeCalendar?.startDate, activeCalendar?.endDate]);

    // Form Hook + validation
    const {
        register,
        handleSubmit,
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

    const selectedClassrooms = watch('classrooms') || [];

    // Handler soumission
    const onSubmit = async (data) => {
        if (!activeCalendar?._id) {
            toast.error('Aucune session active sélectionnée : impossible de créer la progression.');
            return;
        }
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
        const payload = {
            title: data.title,
            classrooms: data.classrooms,
            teachers: [],
            weekList,
            calendar: activeCalendar._id,
        };

        try {
            await createProgression(payload).unwrap();
            toast.success('Progression créée avec succès !');
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la création');
            console.log("erreur", err)
        }
    };

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
                    placeholder="ex: BAC CUIS/CSR 2028"
                />
                {errors.title && (
                    <p className="form-error">
                        {errors.title.message}
                    </p>
                )}
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

            {/* Actions : flex à droite, déjà stylé */}
            <div className="form-actions" style={{ marginTop: 24 }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-muted"
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Création...' : 'Créer la progression'}
                </button>
            </div>
        </form>

    );
};

export default ProgressionForm;
