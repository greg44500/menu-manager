// src/pages/progressions/ProgressionForm.jsx

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useCreateProgressionMutation } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import toast from 'react-hot-toast';
import { Users, CalendarDays } from 'lucide-react';

/**
 * FORMULAIRE DE CRÉATION DE PROGRESSION (session-aware, ultra maintenable)
 * ------------------------------------------------------------------------
 * - Injection automatique de la session (calendarId) sélectionnée via Redux.
 * - Validation UX complète : titre, classes, semaines.
 * - Design ultra cohérent, prêt pour évolution (modularisation, hooks custom).
 */

const ProgressionForm = ({ onSuccess, onClose }) => {
    // --- MUTATION RTK QUERY (création progression) ---
    const [createProgression, { isLoading }] = useCreateProgressionMutation();

    // --- RÉCUPÉRATION DES CLASSES EN BASE ---
    const { data: classroomsData } = useGetAllClassroomsQuery();
    const classrooms = useMemo(() => classroomsData?.classrooms || [], [classroomsData]);

    // --- SESSION ACTIVE (calendarId) ---
    // Récupère la session (calendar) active sélectionnée dans Redux.
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);

    // --- FORM HOOK + VALIDATION ---
    const {
        register,
        handleSubmit,
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

    // --- SUIVI DES CLASSES SÉLECTIONNÉES ---
    const selectedClassrooms = watch('classrooms') || [];

    // --- HANDLER SOUMISSION ---
    const onSubmit = async (data) => {
        // 1. Vérifie la présence d'une session active (UX)
        if (!activeCalendarId) {
            toast.error('Aucune session active sélectionnée : impossible de créer la progression.');
            return;
        }
        // 2. Construit le payload API (calendar injecté)
        const payload = {
            title: data.title,
            classrooms: data.classrooms,
            teachers: [],          // <-- toujours vide à la création (voir section assignation)
            weekNumbers: data.weekNumbers,
            calendar: activeCalendarId, // <-- session active injectée ici
        };

        try {
            await createProgression(payload).unwrap();
            toast.success('Progression créée avec succès !');
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la création');
        }
    };

    // --- UI PRINCIPALE DU FORMULAIRE ---
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            {/* -------- TITRE -------- */}
            <div className="form-control">
                <label className="label label-required label-icon">
                    Titre de la progression
                </label>
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

            {/* -------- CLASSES -------- */}
            <div className="form-control">
                <label className="label label-required label-icon">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} className="text-muted" />
                        <span>Classes assignées</span>
                        {selectedClassrooms.length > 0 && (
                            <span className="badge badge-primary">
                                {selectedClassrooms.length} sélectionnée{selectedClassrooms.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
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

            {/* -------- SEMAINES -------- */}
            <div className="form-control">
                <label className="label label-required label-icon">
                    <CalendarDays size={16} className="text-muted" />
                    <span>Semaines de présence en centre</span>
                </label>
                <input
                    type="text"
                    placeholder="ex: 12,13,14,15"
                    onChange={(e) => {
                        const parsed = e.target.value
                            .split(',')
                            .map(num => parseInt(num.trim(), 10))
                            .filter(n => !isNaN(n) && n > 0 && n <= 53);
                        setValue('weekNumbers', parsed);
                    }}
                    className={`input ${errors.weekNumbers ? 'input-error' : ''}`}
                />
                {errors.weekNumbers && (
                    <p className="form-error" style={{ color: 'var(--error)' }}>
                        {errors.weekNumbers.message}
                    </p>
                )}
                <p className="summary-grid" style={{ color: 'var(--text-muted)' }}>
                    Séparez les numéros par des virgules (ex: 12, 13, 14)
                </p>
            </div>

            {/* -------- INFO FORMATEURS -------- */}
            <div className="card card-summary">
                <div className="card-content">
                    <div className='label-icon'>
                        <Users size={16} style={{ color: 'var(--primary)' }} />
                        <h4 className='card-title-form'>
                            Assignation des formateurs
                        </h4>
                    </div>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Les formateurs seront assignés après la création via le bouton "Assigner formateurs"
                    </p>
                </div>
            </div>

            {/* -------- BOUTONS ACTION -------- */}
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
