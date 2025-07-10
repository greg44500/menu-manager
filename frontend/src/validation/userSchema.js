// frontend/src/validation/userSchema.js
import * as yup from 'yup'

const userSchema = yup.object({
  firstname: yup.string().required('Le prénom est requis'),
  lastname: yup.string().required('Le nom est requis'),
  email: yup.string()
    .email('Format d\'email invalide')
    .matches(/@citeformations\.com$/, 'L\'email doit se terminer par @citeformations.com')
    .required('L\'email est requis'),
  password: yup.string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: yup.string()
    .oneOf(['user', 'manager', 'superAdmin'], 'Sélectionnez un rôle valide dans la liste')
    .required('Le rôle est requis'),
  specialization: yup.string()
    .oneOf(['cuisine', 'service'], 'Sélectionnez une spécialisation valide dans la liste')
    .required('La spécialisation est requise'),
  isActive: yup.boolean()
})

export default userSchema