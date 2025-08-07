// src/pages/menus/sectionConfig.js

export const SECTIONS_CONFIG = {
    'AB': {
        label: 'AB',
        color: '#eab308',        // Jaune, adapte à ton thème
        duplicable: false,
    },
    'Entrée': {
        label: 'Entrées',
        color: '#10b981',        // Vert, adapte à ton thème
        duplicable: false,
    },
    'Plat': {
        label: 'Plats',
        color: '#2563eb',        // Bleu
        duplicable: false,
    },
    'Fromage': {
        label: 'Fromages',
        color: '#f59e42',        // Orange clair
        duplicable: false,
    },
    'Dessert': {
        label: 'Desserts',
        color: '#a21caf',        // Violet
        duplicable: true,       // Mets true si tu veux tester la duplication
    },
    'Boisson': {
        label: 'Boissons',
        color: '#818cf8',        // Indigo
        duplicable: false,
    },
    // Ajoute d’autres sections si besoin
}

// Pour avoir toujours le même ordre d’affichage :
export const SECTIONS_ORDER = ['AB', 'Entrée', 'Plat', 'Fromage', 'Dessert', 'Boisson']
