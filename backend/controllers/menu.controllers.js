const mongoose = require('mongoose');
const Menu = require('../models/menu.model');
const asyncHandler = require('express-async-handler');
const Service = require("../models/service.model");
// Ajout du modèle d'historique pour la traçabilité des menus
const MenuHistory = require("../models/history.model");

/**
 * @desc    Créer un nouveau menu (un seul menu par service)
 * @route   POST /api/menus
 * @method  POST
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 */
const createMenu = asyncHandler(async (req, res) => {

    const { serviceId, sections } = req.body;
    const userId = req.user.id;

    // VALIDATION STRICTE
    if (!serviceId) {
        return res.status(400).json({
            success: false,
            message: "Service ID manquant"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Service ID invalide"
        });
    }

    // VÉRIFICATION SERVICE
    const service = await Service.findById(serviceId);
    if (!service) {
        return res.status(404).json({
            success: false,
            message: "Service non trouvé"
        });
    }

    // VÉRIFICATION MENU EXISTANT
    const existingMenu = await Menu.findOne({ service: serviceId });
    if (existingMenu) {
        return res.status(400).json({
            success: false,
            message: "Un menu existe déjà pour ce service"
        });
    }

    try {
        // CRÉATION DU MENU
        const menu = new Menu({
            service: serviceId,
            sections: sections || {},
            authors: [userId],
        });

        const createdMenu = await menu.save();
        console.log('Menu créé:', createdMenu._id);

        // MISE À JOUR DU SERVICE
        service.menu = createdMenu._id;
        await service.save();

        // RÉPONSE SUCCESS
        res.status(201).json({
            success: true,
            message: "Menu créé avec succès",
            data: createdMenu
        });

    } catch (error) {
        console.error('❌ Erreur création menu:', error);

        // GESTION D'ERREUR DÉTAILLÉE
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Erreur de validation",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la création du menu",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @desc    Récupérer tous les menus
 * @route   GET /api/menus
 * @method  GET
 * @access  Privé (tous rôles connectés)
 */
const getAllMenus = asyncHandler(async (req, res) => {
    const menus = await Menu.find()
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Cocktail',
            model: 'Item',
             populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: menus.length,
        data: menus.length ? menus : "Aucun menu à afficher"
    });
});

/**
 * @desc    Mettre à jour une section précise d’un menu (ajout/suppression/modification des items de la section)
 * @route   PATCH /api/menus/:id/sections/:sectionKey
 * @method  PATCH
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 * @body    { items: Array<ObjectId> }  // Tableau d'IDs des items à associer à la section
 * @returns Menu mis à jour avec la section concernée modifiée, et historique des modifications
 */
const patchMenuSection = async (req, res) => {
    const { id, sectionKey } = req.params;
    const { items } = req.body; // items: array of Item IDs

    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Le champ 'items' (tableau d'IDs d'items) est requis." });
    }

    // Récupération du menu
    const menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé." });
    }

    // Vérification du nom de section
    const validSections = Object.keys(menu.sections);
    if (!validSections.includes(sectionKey)) {
        return res.status(400).json({ message: `Section invalide. Sections possibles : ${validSections.join(', ')}` });
    }

    // Pour la traçabilité, conserver l'état avant modification
    const oldSection = [...(menu.sections[sectionKey] || [])];

    // Mise à jour de la section
    menu.sections[sectionKey] = items;

    // Ajout de l'auteur si non présent
    const authorId = req.user.id?.toString() || req.user._id?.toString();
    if (!menu.authors.map(a => a.toString()).includes(authorId)) {
        menu.authors.push(authorId);
    }

    // Sauvegarde du menu
    await menu.save();

    // Log historique
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        action: "update",
        author: authorId,
        date: new Date(),
        changes: {
            section: sectionKey,
            before: oldSection,
            after: items
        },
        comment: `Modification de la section '${sectionKey}'`
    });

    // Récupérer le menu mis à jour avec la population si besoin
    const updatedMenu = await Menu.findById(menu._id)
        .populate('service')
        .populate({
            path: Object.keys(menu.sections).map(k => `sections.${k}`).join(' '),
            model: 'Item',
            populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors');

    res.status(200).json({
        success: true,
        message: `Section '${sectionKey}' mise à jour avec succès`,
        data: updatedMenu
    });
};

/**
 * @desc    Récupérer un menu spécifique par ID
 * @route   GET /api/menus/:id
 * @method  GET
 * @access  Privé (tous rôles connectés)
 */
const getMenuById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID de menu invalide.");
    }
    const menu = await Menu.findById(id)
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Cocktail',
            model: 'Item',
             populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors');
    if (!menu) {
        res.status(404);
        throw new Error("Menu non trouvé.");
    }
    res.status(200).json(menu);
});

/**
 * @desc    Modifier un menu (seuls les co-auteurs, managers, admins peuvent modifier)
 * @route   PUT /api/menus/:id
 * @method  PUT
 * @access  Privé (co-auteur, manager, admin)
 */
const updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sections, isRestaurant } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID de menu invalide.");
    }

    let menu = await Menu.findById(id);
    if (!menu) {
        res.status(404);
        throw new Error("Menu non trouvé.");
    }

    // Vérification des droits (co-auteur, manager, admin)
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (menu.authors && menu.authors.map(a => a.toString()).includes(req.user.id));
    if (!isAllowed) {
        res.status(403);
        throw new Error("Accès refusé.");
    }

    // Pour la traçabilité, conserver l'état avant modification
    const oldMenu = { ...menu._doc };

    // Mise à jour des sections uniquement si elles sont envoyées (pas d'écrasement des sections non modifiées)
    if (sections) menu.sections = sections;
    menu.isRestaurant = typeof isRestaurant === "boolean" ? isRestaurant : menu.isRestaurant;
    menu = await menu.save();

    // Traçabilité : log de modification dans MenuHistory
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        action: "update",
        author: req.user.id,
        date: new Date(),
        changes: { before: oldMenu, after: { ...menu._doc } },
        comment: "Modification du menu"
    });

    res.status(200).json(menu);
});

/**
 * @desc    Supprimer un menu (seuls les co-auteurs, managers, admins peuvent supprimer)
 * @route   DELETE /api/menus/:id
 * @method  DELETE
 * @access  Privé (co-auteur, manager, admin)
 */
const deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID de menu invalide.");
    }

    const menu = await Menu.findById(id);
    if (!menu) {
        res.status(404);
        throw new Error("Menu non trouvé.");
    }

    // Vérification des droits (co-auteur, manager, admin)
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (menu.authors && menu.authors.map(a => a.toString()).includes(req.user.id));
    if (!isAllowed) {
        res.status(403);
        throw new Error("Accès refusé.");
    }

    // Traçabilité : log de suppression avant suppression effective
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        entityType: "menu",
        action: "delete",
        author: req.user.id,
        date: new Date(),
        changes: { ...menu._doc },
        comment: "Suppression du menu"
    });

    // Détacher le menu du service lié (propre)
    const service = await Service.findById(menu.service);
    if (service && service.menu && service.menu.toString() === menu._id.toString()) {
        service.menu = null;
        await service.save();
    }

    await menu.deleteOne();
    res.status(200).json({
        message: "Menu supprimé avec succès."
    });
});

module.exports = {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    patchMenuSection
};
