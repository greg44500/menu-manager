// src/pages/progressions/ProgressionFormEdit.jsx
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { progressionSchema } from '../../validation/progressionSchema';
import { useUpdateProgressionMutation } from '../../store/api/progressionsApi';
import { useGetAllUsersQuery } from '../../store/api/usersApi';
import { useGetAllClassroomsQuery } from '../../store/api/classroomsApi';



const ProgressionFormEdit = ({ progression, onSuccess }) => {
    const [updateProgression, { isLoading }] = useUpdateProgressionMutation();
    const { data: usersData } = useGetAllUsersQuery();
    const { data: classroomsData } = useGetAllClassroomsQuery();

    const teachers = usersData?.data?.filter(u => u.role === 'user') || [];
    const classrooms = classroomsData?.classrooms || [];

    const {
        register,
        handleSubmit,
        reset,
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
        return teachers.filter(t =>
            t.classrooms?.some(cls => selectedClassroomIds.includes(cls._id))
        );
    }, [selectedClassroomIds, teachers]);

    useEffect(() => {
        if (progression) {
            reset({
                classrooms: progression.classrooms?.map(c => c._id),
                teachers: progression.teachers?.map(t => t._id),
                weekNumbers: progression.weekNumbers || []
            });
        }
    }, [progression, reset]);

    const onSubmit = async (data) => {
        try {
            await updateProgression({ id: progression._id, ...data }).unwrap();
            onSuccess?.();
        } catch (err) {
            console.error('Erreur modification progression', err);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block mb-1">Classes</label>
                <select
                    {...register('classrooms')}
                    multiple
                    className="w-full border rounded p-2"
                >
                    {classrooms.map(c => (
                        <option key={c._id} value={c._id}>{c.name || c.virtualName}</option>
                    ))}
                </select>
                {errors.classrooms && <p className="text-red-500 text-sm">{errors.classrooms.message}</p>}
            </div>

            <div>
                <label className="block mb-1">Formateurs</label>
                <select
                    {...register('teachers')}
                    multiple
                    className="w-full border rounded p-2"
                >
                    {filteredTeachers.map(t => (
                        <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>
                    ))}
                </select>
                {errors.teachers && <p className="text-red-500 text-sm">{errors.teachers.message}</p>}
            </div>

            <div>
                <label className="block mb-1">Semaines</label>
                <input
                    type="text"
                    placeholder="ex: 12,13,14"
                    defaultValue={progression?.weekNumbers?.join(', ') || ''}
                    onChange={(e) => {
                        const parsed = e.target.value
                            .split(',')
                            .map(num => parseInt(num.trim(), 10))
                            .filter(n => !isNaN(n));
                        setValue('weekNumbers', parsed);
                    }}
                    className="w-full border rounded p-2"
                />
                {errors.weekNumbers && <p className="text-red-500 text-sm">{errors.weekNumbers.message}</p>}
            </div>

            <div className="text-right">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Mise à jour...' : 'Modifier'}
                </button>
            </div>
        </form>
    );
};

export default ProgressionFormEdit;