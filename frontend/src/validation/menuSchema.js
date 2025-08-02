import * as yup from 'yup'

export const menuSchema = yup.object().shape({
    // sections est un objet dynamique, chaque clé (AB, Entree, ...) est un array d'IDs (strings)
    sections: yup.object().test(
        'at-least-one-section',
        'Renseigne au moins une section du menu avec au moins un item',
        value => {
            // value est un objet, ex: { Entree: [...], Plat: [...] }
            if (!value || typeof value !== 'object') return false
            // Il faut au moins une section non vide
            return Object.values(value).some(
                arr => Array.isArray(arr) && arr.length > 0
            )
        }
    ),
})
