import * as yup from 'yup'

 export const classroomSchema = yup.object().shape({
  diploma: yup.string().required('Le diplôme est requis'),
  category: yup.string().required('La filière est requise'),
  group: yup.string(),
  certificationSession: yup.number().required('L’année de certification est requise').typeError('Doit être un nombre'),
});