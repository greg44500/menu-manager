import * as yup from 'yup'

export const progressionSchema = yup.object().shape({
  title: yup.string().required('Le titre est requis'),
  classrooms: yup.array().min(1, 'Au moins une classe est requise.'),
  teachers: yup.array().min(1, 'Au moins un formateur est requis.'),
  weekNumbers: yup
    .array()
    .of(yup.number().min(1).max(52))
    .min(1, 'Saisir au moins un numéro de semaine.')
});