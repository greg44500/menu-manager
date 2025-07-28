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
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            {/* TITRE */}
            <div className="form-control">
                <label className="label label-required">Titre de la progression</label>
                <input
                    {...register("title")}
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="ex: BAC CUIS/CSR 2028"
                />
                {errors.title && (
                    <p className="form-error" style={{ color: 'var(--error)' }}>
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* CLASSES */}
            <div className="form-control">
                <label className="label label-required">
                    Classes assignées
                    {selectedClassrooms.length > 0 && (
                        <span className="badge badge-primary">
                            {selectedClassrooms.length} sélectionnée{selectedClassrooms.length > 1 ? 's' : ''}
                        </span>
                    )}
                </label>
                <select
                    {...register('classrooms')}
                    multiple
                    className={`input ${errors.classrooms ? 'input-error' : ''}`}
                    style={{ minHeight: '120px' }}
                >
                    {classrooms.map(cls => (
                        <option key={cls._id} value={cls._id}>
                            {cls.name || cls.virtualName}
                        </option>
                    ))}
                </select>
                {errors.classrooms && (
                    <p className="form-error" style={{ color: 'var(--error)' }}>
                        {errors.classrooms.message}
                    </p>
                )}
                <p className="summary-grid" style={{ color: 'var(--text-muted)' }}>
                    Maintenir Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs classes
                </p>
            </div>

            {/* SEMAINES */}
            <div className="teacher-list">
                <label className="label label-required">
                    Semaines de présence en centre (selon session)
                </label>
              <div className={`checkbox-list ${errors.weeks ? 'input-error' : ''}`}>
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
                    <p className="form-error" style={{ color: 'var(--error)' }}>
                        {errors.weeks.message}
                    </p>
                )}
                <p className="summary-grid" style={{ color: 'var(--text-muted)' }}>
                    Les semaines disponibles sont celles de la session sélectionnée
                </p>
            </div>

            {/* ASSIGNATION FORMATEURS */}
            <div className="card card-summary">
                <div className="card-content">
                    <h4 className='card-title-form'>
                        Assignation des formateurs
                    </h4>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Les formateurs seront assignés après la création via le bouton "Assigner formateurs"
                    </p>
                </div>
            </div>

            {/* BOUTONS ACTION */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
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
