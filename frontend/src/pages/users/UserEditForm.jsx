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
        reset
    } = useForm({
        resolver: yupResolver(editUserSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                role: user.role || '',
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
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            {/* Prénom (lecture seule) */}
            <div className='form-group'>
                <label className="label">Prénom</label>
                <input
                    className='input'
                    type='text'
                    value={user?.firstname || ''}
                    readOnly
                />
            </div>

            {/* Nom (lecture seule) */}
            <div className='form-group'>
                <label className="label">Nom</label>
                <input
                    className='input'
                    type='text'
                    value={user?.lastname || ''}
                    readOnly
                />
            </div>
            {/* Email (lecture seule) */}
            <div className='form-group'>
                <label className="label">Email</label>
                <input
                    className='input'
                    type='text'
                    value={user?.email || ''}
                    readOnly
                />
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

            {/* Statut */}
            <div className='form-group'>
                <label className="label">Statut</label>
                <select className={`input ${errors.isActive ? 'input-error' : ''}`} {...register("isActive")}>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                </select>
            </div>

            {/* Boutons */}
            <div className="form-footer">
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
