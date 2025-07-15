// src/pages/progressions/ProgressionForm.jsx
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useCreateProgressionMutation } from '../../store/api/progressionsApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';
import toast from 'react-hot-toast';

const ProgressionForm = ({ onSuccess, onClose, mode = 'create' }) => {
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
            classrooms: [],
            teachers: [],
            weekNumbers: []
        }
    });

    const selectedClassroomIds = watch('classrooms');
    const filteredTeachers = useMemo(() => {

        if (!selectedClassroomIds?.length) return [];

        const teachersSet = new Map();

        classrooms.forEach(cls => {
            if (selectedClassroomIds.includes(cls._id)) {
                cls.assignedTeachers?.forEach(teacher => {
                    if (teacher && teacher._id && !teachersSet.has(teacher._id)) {
                        teachersSet.set(teacher._id, teacher);
                    }
                });
            }
        });

        const result = Array.from(teachersSet.values());
        return result;
    }, [selectedClassroomIds, classrooms]);

    const onSubmit = async (data) => {
        try {
            await createProgression(data).unwrap();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error('Erreur création progression', err);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            <div className="form-control">
                <label className="label label-required">Titre</label>
                <input {...register("title")} className={`input ${errors.title ? 'input-error' : ''}`} />
                {errors.progressions && <p className="text-error text-sm mt-1">{errors.progressions.title}</p>}
            </div>
            <div className="form-control">
                <label className="label label-required">Classes</label>
                <select
                    {...register('classrooms')}
                    multiple
                    className='input'
                >
                    {classrooms.map(c => (
                        <option key={c._id} value={c._id}>{c.name || c.virtualName}</option>
                    ))}
                </select>
                {errors.classrooms && <p className="text-error text-sm mt-1">{errors.classrooms.message}</p>}
            </div>

            <div className="form-control">
                <label className="label label-required">Formateurs assignés</label>
                <select
                    {...register('teachers')}
                    multiple
                    className='input'
                >
                    {filteredTeachers.map(t => (
                        <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>
                    ))}
                </select>
                {errors.teachers && <p className="text-error text-sm mt-1">{errors.teachers.message}</p>}
            </div>

            <div className="form-control">
                <label className="label label-required">Semaines</label>
                <input
                    type="text"
                    placeholder="ex: 12,13,14"
                    onChange={(e) => {
                        const parsed = e.target.value
                            .split(',')
                            .map(num => parseInt(num.trim(), 10))
                            .filter(n => !isNaN(n));
                        setValue('weekNumbers', parsed);
                    }}
                    className='input'
                />
                {errors.weekNumbers && <p className="text-error text-sm mt-1">{errors.weekNumbers.message}</p>}
            </div>

            <div className="form-control text-right">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Chargement...' : mode === 'edit' ? 'Modifier' : 'Créer'}
                </button>
            </div>
        </form>
    );
};

export default ProgressionForm;
