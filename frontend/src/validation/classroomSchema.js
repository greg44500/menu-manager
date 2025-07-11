import * as yup from 'yup'

 export const classroomSchema = yup.object().shape({
  diploma: yup.string().required('Le diplôme est requis'),
  category: yup.string().required('La filière est requise'),
  group: yup.string().required('Le groupe est requis'),
  certificationSession: yup.number().required('L’année de certification est requise').typeError('Doit être un nombre'),
  alternationNumber: yup.number().required('Le nombre d’alternance est requis').min(1).max(3).typeError('Doit être un nombre entre 1 et 3'),
});