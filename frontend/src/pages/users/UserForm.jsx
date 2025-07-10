import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle } from 'lucide-react';
import userSchema from '../../validation/userSchema';
import { useCreateUserMutation } from '../../store/api/usersApi';
import { toast } from 'react-hot-toast';

const UserForm = ({ onSuccess }) => {
  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      role: '',
      specialization: '',
      isActive: true
    }
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[480px]">

      {/* Prénom */}
      <div className='form-group'>
        <label className="label label-required">Prénom</label>
        <input {...register("firstname")} className={`input ${errors.firstname ? 'input-error' : ''}`} />
        {errors.firstname && (
          <p className="form-error">
            <AlertCircle size={14} /> {errors.firstname.message}
          </p>
        )}
      </div>

      {/* Nom */}
      <div className='form-group'>
        <label className="label label-required">Nom</label>
        <input {...register("lastname")} className={`input ${errors.lastname ? 'input-error' : ''}`} />
        {errors.lastname && (
          <p className="form-error">
            <AlertCircle size={14} /> {errors.lastname.message}
          </p>
        )}
      </div>
       {/* Email */}
      <div className='form-group'>
        <label className="label label-required">Email</label>
        <input type="email" {...register("email")} className={`input ${errors.email ? 'input-error' : ''}`} />
        {errors.email && (
          <p className="form-error">
            <AlertCircle size={14} /> {errors.email.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div className='form-group'>
        <label className="label label-required">Mot de passe</label>
        <input type="password" {...register("password")} className={`input ${errors.password ? 'input-error' : ''}`} />
        {errors.password && (
          <p className="form-error">
            <AlertCircle size={14} /> {errors.password.message}
          </p>
        )}
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

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Création...' : 'Créer utilisateur'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
