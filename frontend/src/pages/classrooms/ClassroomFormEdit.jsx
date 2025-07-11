// frontend/src/pages/classrooms/ClassroomFormEdit.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { classroomSchema } from '../../validation/classroomSchema';
import { useUpdateClassroomMutation } from '../../store/api/classroomsApi';
import { useGetAllUsersQuery } from '../../store/api/usersApi';

const diplomas = ['CAP', 'BAC', 'BP', 'BTS', 'CS'];
const categories = ['CUIS', 'CSHCR', 'CSR', 'AC', 'ACSR', 'MHR', 'CDR', 'BAR', 'SOM'];
const groups = ['A', 'B', 'C'];

const ClassroomFormEdit = ({ classroom, onSuccess }) => {
  const [updateClassroom, { isLoading: isUpdating }] = useUpdateClassroomMutation();
  const { data: usersData } = useGetAllUsersQuery();
  const users = usersData?.users || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(classroomSchema),
    defaultValues: {
      diploma: '',
      category: '',
      group: '',
      certificationSession: '',
      alternationNumber: '',
      assignedTeachers: [],
    },
  });

  useEffect(() => {
    if (classroom) {
      reset({
        diploma: classroom.diploma || '',
        category: classroom.category || '',
        group: classroom.group || '',
        certificationSession: classroom.certificationSession || '',
        alternationNumber: classroom.alternationNumber || '',
        assignedTeachers: classroom.assignedTeachers?.map(t => t._id) || []
      });
    }
  }, [classroom, reset]);

  const onSubmit = async (data) => {
    try {
      await updateClassroom({ id: classroom._id, ...data }).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la modification de la classe :', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[480px]">
      <div className="form-group">
        <label className="label label-required">Diplôme</label>
        <select className="input" {...register('diploma')}>
          <option value="">Sélectionner un diplôme</option>
          {diplomas.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.diploma && <p className="form-error">{errors.diploma.message}</p>}
      </div>

      <div className="form-group">
        <label className="label label-required">Filière</label>
        <select className="input" {...register('category')}>
          <option value="">Sélectionner une filière</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="form-error">{errors.category.message}</p>}
      </div>

      <div className="form-group">
        <label className="label label-required">Groupe</label>
        <select className="input" {...register('group')}>
          <option value="">Sélectionner un groupe</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {errors.group && <p className="form-error">{errors.group.message}</p>}
      </div>

      <div className="form-group">
        <label className="label label-required">Année de certification</label>
        <input
          className="input"
          type="number"
          {...register('certificationSession')}
          placeholder="2025"
        />
        {errors.certificationSession && <p className="form-error">{errors.certificationSession.message}</p>}
      </div>

      <div className="form-group">
        <label className="label label-required">Nombre d’alternances</label>
        <input
          className="input"
          type="number"
          {...register('alternationNumber')}
          placeholder="1 à 3"
        />
        {errors.alternationNumber && <p className="form-error">{errors.alternationNumber.message}</p>}
      </div>
      <div className="form-group">
        <label className="label">Formateur assigné</label>
        <select className="input" {...register('assignedTeachers')}>
          <option value="">Sélectionner un formateur</option>
          {users
            .filter(user => user.role === 'user')
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstname} {user.lastname}
              </option>
            ))}
        </select>
        {errors.assignedTeachers && <p className="form-error">{errors.assignedTeachers.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isUpdating}
        >
          {isUpdating ? 'Chargement...' : 'Modifier'}
        </button>
      </div>
    </form>
  );
};

export default ClassroomFormEdit;
