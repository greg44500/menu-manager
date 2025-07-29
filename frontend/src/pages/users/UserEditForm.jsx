import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { editUserSchema } from '../../validation/userSchema';
import { useUpdateUserMutation } from '../../store/api/usersApi';

const UserEditForm = ({ user, onClose, onSuccess }) => {
    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm({
        resolver: yupResolver(editUserSchema),
    });
    const isTeacher = watch('isTeacher')
    useEffect(() => {
        if (user) {
            reset({
                role: user.role || '',
                isTeacher: user.isTeacher,
                specialization: user.specialization || '',
                isActive: user.isActive === true ? 'true' : 'false',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            isActive: data.isActive === 'true'
        };
        try {
            await updateUser({ id: user._id, ...payload }).unwrap();
            toast.success('Utilisateur modifié avec succès');
            onSuccess?.();
        } catch (err) {
            toast.error(err?.data?.message || 'Erreur lors de la modification');
        }
    };

    return (
       <form onSubmit={handleSubmit(onSubmit)} className="form-container-2col">
  {/* --- Colonne 1 : Infos non modifiables --- */}
  <div>
    {/* Prénom (lecture seule) */}
    <div className='form-group'>
      <label className="label">Prénom</label>
      <input className='input' type='text' value={user?.firstname || ''} readOnly />
    </div>
    {/* Nom (lecture seule) */}
    <div className='form-group'>
      <label className="label">Nom</label>
      <input className='input' type='text' value={user?.lastname || ''} readOnly />
    </div>
    {/* Email (lecture seule) */}
    <div className='form-group'>
      <label className="label">Email</label>
      <input className='input' type='text' value={user?.email || ''} readOnly />
    </div>
     {/* Rôle */}
    <div className='form-group'>
      <label className="label label-required">Rôle</label>
      <select {...register("role")} className={`input ${errors.role ? 'input-error' : ''}`}>
        <option value="">-- Choisir un rôle --</option>
        <option value="user">Utilisateur</option>
        <option value="manager">Manager</option>
        <option value="superAdmin">Super Admin</option>
      </select>
      {errors.role && (
        <p className="form-error">
          <AlertCircle size={14} /> {errors.role.message}
        </p>
      )}
    </div>
  </div>

  {/* --- Colonne 2 : Champs éditables --- */}
  <div>
   
    {/* Toggle formateur */}
    <div className='form-group'>
      <label className="label">Statut de Formateur</label>
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
            transition-transform duration-200 ease-in-out,
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
    {/* Spécialisation */}
    <div className='form-group'>
      <label className="label label-required">Spécialisation</label>
      <select {...register("specialization")} className={`input ${errors.specialization ? 'input-error' : ''}`}>
        <option value="">-- Choisir une spécialisation --</option>
        <option value="cuisine">Cuisine</option>
        <option value="service">Service</option>
      </select>
      {errors.specialization && (
        <p className="form-error">
          <AlertCircle size={14} /> {errors.specialization.message}
        </p>
      )}
    </div>
    {/* Statut */}
    <div className='form-group'>
      <label className="label">Statut</label>
      <select className={`input ${errors.isActive ? 'input-error' : ''}`} {...register("isActive")}>
        <option value="true">Actif</option>
        <option value="false">Inactif</option>
      </select>
    </div>
  </div>

  {/* --- Footer sur toute la largeur --- */}
  <div className="form-actions" style={{ gridColumn: '1/-1' }}>
    <button type="button" className="btn btn-muted" onClick={onClose}>
      Annuler
    </button>
    <button type="submit" className="btn btn-primary" disabled={isLoading}>
      {isLoading ? 'Mise à jour...' : 'Enregistrer'}
    </button>
  </div>
</form>

    );
};

export default UserEditForm;
