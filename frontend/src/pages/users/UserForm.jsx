import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle } from 'lucide-react';
import { userSchema } from '../../validation/userSchema';
import { useCreateUserMutation } from '../../store/api/usersApi';
import { toast } from 'react-hot-toast';

const UserForm = ({ onSuccess }) => {
  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      role: '',
      isTeacher: false,
      specialization: '',
      isActive: true
    }
  });

  const isTeacher = watch('isTeacher')

  const onSubmit = async (data) => {
    try {
      await createUser(data).unwrap();
      toast.success('Utilisateur créé avec succès');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container-2col">

      {/* --- Colonne 1 : infos utilisateur --- */}
      <div>
        <div className='form-group'>
          <label className="label label-required">Prénom</label>
          <input {...register("firstname")} className={`input ${errors.firstname ? 'input-error' : ''}`} />
          {errors.firstname && <p className="form-error"><AlertCircle size={14} /> {errors.firstname.message}</p>}
        </div>
        <div className='form-group'>
          <label className="label label-required">Nom</label>
          <input {...register("lastname")} className={`input ${errors.lastname ? 'input-error' : ''}`} />
          {errors.lastname && <p className="form-error"><AlertCircle size={14} /> {errors.lastname.message}</p>}
        </div>
        <div className='form-group'>
          <label className="label label-required">Email</label>
          <input type="email" {...register("email")} className={`input ${errors.email ? 'input-error' : ''}`} />
          {errors.email && <p className="form-error"><AlertCircle size={14} /> {errors.email.message}</p>}
        </div>
        <div className='form-group'>
          <label className="label label-required">Mot de passe</label>
          <input type="password" {...register("password")} className={`input ${errors.password ? 'input-error' : ''}`} />
          {errors.password && <p className="form-error"><AlertCircle size={14} /> {errors.password.message}</p>}
        </div>
      </div>

      {/* --- Colonne 2 : rôle, formateur, spécialisation --- */}
      <div>
        <div className='form-group'>
          <label className="label label-required">Rôle</label>
          <select {...register("role")} className={`input ${errors.role ? 'input-error' : ''}`}>
            <option value="">-- Choisir un rôle --</option>
            <option value="user">Utilisateur</option>
            <option value="manager">Manager</option>
            <option value="superAdmin">Super Admin</option>
          </select>
          {errors.role && <p className="form-error"><AlertCircle size={14} /> {errors.role.message}</p>}
        </div>
        <div className='form-group'>
          <label className="label">Statut de Formateur</label>
          {/* Bouton toggle formateur - LOGIQUE INCHANGÉE */}
          <button
            type="button"
            onClick={() => setValue('isTeacher', !isTeacher)}
            className={`
          theme-toggle
          relative inline-flex items-center 
          rounded-full border-2 border-transparent 
          transition-all duration-500 ease-in-out 
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          cursor-pointer
          ${isTeacher ? 'theme-toggle-active' : ''}
        `}
            style={{
              backgroundColor: isTeacher ? 'var(--success)' : 'var(--error)',
              boxShadow: isTeacher
                ? '0 4px 12px rgba(235, 94, 40, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                : 'inset 0 2px 4px rgba(37, 36, 34, 0.1)'
            }}
            role="switch"
            aria-checked={isTeacher}
            aria-label={`Formateur : ${isTeacher ? 'oui' : 'non'}`}
            title={`Formateur : ${isTeacher ? 'Oui' : 'Non'}`}
          >
            <span
              className={`
            theme-toggle-button
            inline-flex items-center justify-center
            transition-transform duration-200 ease-in-out
            ${isTeacher ? 'theme-toggle-button-active' : ''}
          `}
              style={{
                backgroundColor: 'var(--surface)',
                boxShadow: isTeacher
                  ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 2px 4px rgba(37, 36, 34, 0.1)',
                fontSize: '0.75rem',
                fontWeight: 'Bold',
              }}
            >
              {isTeacher ? 'O' : 'N'}
            </span>
          </button>
        </div>
        <div className='form-group'>
          <label className="label label-required">Spécialisation</label>
          <select {...register("specialization")} className={`input ${errors.specialization ? 'input-error' : ''}`}>
            <option value="">-- Choisir une spécialisation --</option>
            <option value="cuisine">Cuisine</option>
            <option value="service">Service</option>
          </select>
          {errors.specialization && <p className="form-error"><AlertCircle size={14} /> {errors.specialization.message}</p>}
        </div>
      </div>

      {/* --- Bouton sur toute la largeur (pas de scroll) --- */}
      <div className="form-actions" style={{ gridColumn: '1/-1' }}>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Création...' : 'Créer utilisateur'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
