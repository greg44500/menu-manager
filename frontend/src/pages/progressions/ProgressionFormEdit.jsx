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
        const submissionData = {
            title: data.title,
            classrooms: Array.isArray(data.classrooms) ? data.classrooms : [],
            weekList,
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

    // UI du formulaire (aucun changement de style)
    return (

        <form onSubmit={handleSubmit(onSubmit)} >
            {/* Champ: Titre progression */}
            <div className="form-group">
                <label className="label label-required">Titre de la progression</label>
                <input {...register("title")} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Ex: BP AC 2 2028" />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            {/* Champ: Classes assignées */}
            <label className="label label-required ">Classes assignées</label>
            <div className="teacher-list">
                <div className={`checkbox-list ${errors.classrooms ? 'input-error' : ''}`}>
                    {classrooms.map(cls => (
                        <label key={cls._id} style={{ display: 'block', marginBottom: 6 }}>
                            <input
                                type="checkbox"
                                value={cls._id}
                                {...register('classrooms')}
                                style={{ marginRight: 8 }}
                            // RHF gère le "checked" si tu utilises bien "defaultValues" et "reset"
                            />
                            {cls.name || cls.virtualName}
                        </label>
                    ))}
                </div>
                {errors.classrooms && <p className="form-error">{errors.classrooms.message}</p>}
            </div>

            {/* Champ: Semaine(s) de la progression */}
            <label className="label label-required">Semaines concernées (selon session)</label>
            <div className="teacher-list">
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
                                // RHF gère le "checked" selon les valeurs passées à "defaultValues" ou "reset"
                                />
                                Semaine {w.weekNumber} ({w.year}) - {w.date.toLocaleDateString('fr-FR')}
                            </label>
                        );
                    })}
                </div>
                {errors.weeks && <p className="form-error">{errors.weeks.message}</p>}
            </div>

            {/* BOUTONS ACTION */}
            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>Mettre à jour</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
};

export default ProgressionFormEdit;
