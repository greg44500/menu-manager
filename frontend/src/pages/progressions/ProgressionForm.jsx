// src/pages/progressions/ProgressionForm.jsx - VERSION CORRIGÉE
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useCreateProgressionMutation } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import toast from 'react-hot-toast';
import { Users, CalendarDays } from 'lucide-react';

/**
 * FORMULAIRE DE CRÉATION DE PROGRESSION - VERSION SIMPLIFIÉE
 * 
 * LOGIQUE CORRIGÉE :
 * - Seulement : Titre + Classes + Semaines
 * - PAS de sélection de formateurs (se fait via modale séparée)
 * - Utilise le style terracotta existant
 */

const ProgressionForm = ({ onSuccess, onClose}) => {
    const [createProgression, { isLoading }] = useCreateProgressionMutation();
    const { data: classroomsData } = useGetAllClassroomsQuery();

    const classrooms = useMemo(() => classroomsData?.classrooms || [], [classroomsData]);

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

    const selectedClassrooms = watch('classrooms') || [];

    const onSubmit = async (data) => {
        const payload = {
            title: data.title,
            classrooms: data.classrooms,
            teachers: [], // ← Vide à la création
            weekNumbers: data.weekNumbers
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">

            {/* TITRE */}
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

            {/* CLASSES */}
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

            {/* SEMAINES */}
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

            {/* INFO FORMATEURS */}
            <div className="card card-summary" >
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

            {/* BOUTONS */}
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