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
    const { serviceId, sections, productionAssignment } = req.body; // ⚡ Ajout productionAssignment
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
        // CRÉATION DU MENU avec productionAssignment
        const menu = new Menu({
            service: serviceId,
            sections: sections || {},
            productionAssignment: productionAssignment || { // ⚡ NOUVEAU
                cuisine: [],
                service: []
            },
            authors: [userId],
        });

        const createdMenu = await menu.save();
        console.log('Menu créé avec répartition:', {
            id: createdMenu._id,
            cuisine: createdMenu.productionAssignment?.cuisine,
            service: createdMenu.productionAssignment?.service
        });

        // MISE À JOUR DU SERVICE
        service.menu = createdMenu._id;
        await service.save();

        // Traçabilité
        await MenuHistory.create({
            entity: createdMenu._id,
            entityType: "menu",
            action: "create",
            author: userId,
            date: new Date(),
            changes: {
                sections: sections,
                productionAssignment: productionAssignment
            },
            comment: "Création du menu avec répartition des productions"
        });

        // RÉPONSE SUCCESS avec populate complet
        const populatedMenu = await Menu.findById(createdMenu._id)
            .populate('service')
            .populate({
                path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
                model: 'Item',
                populate: { path: 'authors', select: 'firstname lastname role' }
            })
            .populate('authors', 'firstname lastname role');

        res.status(201).json({
            success: true,
            message: "Menu créé avec succès",
            data: populatedMenu
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
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
            model: 'Item',
            populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors', 'firstname lastname role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: menus.length,
        data: menus.length ? menus : []
    });
});

/**
 * @desc    Mettre à jour une section précise d'un menu (ajout/suppression/modification des items de la section)
 * @route   PATCH /api/menus/:id/sections/:sectionKey
 * @method  PATCH
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 * @body    { items: Array<ObjectId>, updateAssignment: Boolean }
 * @returns Menu mis à jour avec la section concernée modifiée
 */
const patchMenuSection = asyncHandler(async (req, res) => {
    const { id, sectionKey } = req.params;
    const { items, updateAssignment, columnType } = req.body; // ⚡ Ajout columnType (cuisine/service)

    if (!Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: "Le champ 'items' (tableau d'IDs d'items) est requis."
        });
    }

    // Récupération du menu
    const menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({
            success: false,
            message: "Menu non trouvé."
        });
    }

    // Vérification du nom de section
    const validSections = ['AB', 'Entrée', 'Plat', 'Fromage', 'Dessert', 'Boisson'];
    if (!validSections.includes(sectionKey)) {
        return res.status(400).json({
            success: false,
            message: `Section invalide. Sections possibles : ${validSections.join(', ')}`
        });
    }

    // Pour la traçabilité, conserver l'état avant modification
    const oldSection = [...(menu.sections[sectionKey] || [])];
    const oldAssignment = menu.productionAssignment ?
        JSON.parse(JSON.stringify(menu.productionAssignment)) : null;

    // Mise à jour de la section
    menu.sections[sectionKey] = items;

    // NOUVEAU : Mise à jour de l'assignation si demandée
    if (updateAssignment && columnType) {
        if (!menu.productionAssignment) {
            menu.productionAssignment = { cuisine: [], service: [] };
        }

        // Retirer la section des deux colonnes d'abord
        menu.productionAssignment.cuisine = menu.productionAssignment.cuisine.filter(s => s !== sectionKey);
        menu.productionAssignment.service = menu.productionAssignment.service.filter(s => s !== sectionKey);

        // Ajouter dans la bonne colonne
        if (columnType === 'cuisine' && !menu.productionAssignment.cuisine.includes(sectionKey)) {
            menu.productionAssignment.cuisine.push(sectionKey);
        } else if (columnType === 'service' && !menu.productionAssignment.service.includes(sectionKey)) {
            menu.productionAssignment.service.push(sectionKey);
        }
    }

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
            before: {
                items: oldSection,
                assignment: oldAssignment
            },
            after: {
                items: items,
                assignment: menu.productionAssignment
            }
        },
        comment: `Modification de la section '${sectionKey}'${columnType ? ` assignée à ${columnType}` : ''}`
    });

    // Récupérer le menu mis à jour avec la population
    const updatedMenu = await Menu.findById(menu._id)
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
            model: 'Item',
            populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors', 'firstname lastname role');

    res.status(200).json({
        success: true,
        message: `Section '${sectionKey}' mise à jour avec succès`,
        data: updatedMenu
    });
});

/**
 * @desc    Récupérer un menu spécifique par ID
 * @route   GET /api/menus/:id
 * @method  GET
 * @access  Privé (tous rôles connectés)
 */
const getMenuById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de menu invalide."
        });
    }

    const menu = await Menu.findById(id)
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
            model: 'Item',
            populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors', 'firstname lastname role');

    if (!menu) {
        return res.status(404).json({
            success: false,
            message: "Menu non trouvé."
        });
    }

    res.status(200).json({
        success: true,
        data: menu
    });
});

/**
 * @desc    Modifier un menu (seuls les co-auteurs, managers, admins peuvent modifier)
 * @route   PUT /api/menus/:id
 * @method  PUT
 * @access  Privé (co-auteur, manager, admin)
 */
const updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sections, isRestaurant, productionAssignment } = req.body; // ⚡ Ajout productionAssignment

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de menu invalide."
        });
    }

    let menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({
            success: false,
            message: "Menu non trouvé."
        });
    }

    // Vérification des droits (co-auteur, manager, admin)
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (menu.authors && menu.authors.map(a => a.toString()).includes(req.user.id));

    if (!isAllowed) {
        return res.status(403).json({
            success: false,
            message: "Accès refusé."
        });
    }

    // Pour la traçabilité, conserver l'état avant modification
    const oldMenu = {
        sections: JSON.parse(JSON.stringify(menu.sections)),
        productionAssignment: menu.productionAssignment ?
            JSON.parse(JSON.stringify(menu.productionAssignment)) : null,
        isRestaurant: menu.isRestaurant
    };

    // Mise à jour des champs
    if (sections) menu.sections = sections;

    // NOUVEAU : Mise à jour de la répartition des productions
    if (productionAssignment) {
        menu.productionAssignment = productionAssignment;
        console.log('Mise à jour de la répartition:', productionAssignment);
    }

    if (typeof isRestaurant === "boolean") {
        menu.isRestaurant = isRestaurant;
    }

    // Ajout de l'auteur si non présent
    const authorId = req.user.id?.toString() || req.user._id?.toString();
    if (!menu.authors.map(a => a.toString()).includes(authorId)) {
        menu.authors.push(authorId);
    }

    menu = await menu.save();

    // Traçabilité : log de modification dans MenuHistory
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        action: "update",
        author: req.user.id,
        date: new Date(),
        changes: {
            before: oldMenu,
            after: {
                sections: menu.sections,
                productionAssignment: menu.productionAssignment,
                isRestaurant: menu.isRestaurant
            }
        },
        comment: productionAssignment ?
            "Modification du menu avec répartition des productions" :
            "Modification du menu"
    });

    // Récupérer le menu mis à jour avec population
    const updatedMenu = await Menu.findById(menu._id)
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
            model: 'Item',
            populate: { path: 'authors', select: 'firstname lastname role' }
        })
        .populate('authors', 'firstname lastname role');

    res.status(200).json({
        success: true,
        message: "Menu mis à jour avec succès",
        data: updatedMenu
    });
});

/**
 * @desc    Modifier un menu (seuls les co-auteurs, managers, admins peuvent modifier)
 * @route   PUT /api/menus/:id
 * @method  PUT
 * @access  Privé (co-auteur, manager, admin)
 */
// PATCH /api/menus/:id  (toggle / set isMenuValidate)
const patchMenuValidation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isMenuValidate } = req.body; // true | false

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID de menu invalide." });
    }

    // Trouver le menu
    const menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({ success: false, message: "Menu non trouvé." });
    }

    // Droits: superAdmin, manager, ou co‑auteur
    const userId = req.user?.id?.toString() || req.user?._id?.toString();
    const isCoAuthor = (menu.authors || []).map(a => a.toString()).includes(userId);
    const isAllowed = ["superAdmin", "manager"].includes(req.user?.role) || isCoAuthor;

    if (!isAllowed) {
        return res.status(403).json({ success: false, message: "Accès refusé." });
    }

    // État avant, pour l'historique
    const before = { isMenuValidate: menu.isMenuValidate };

    // Mise à jour ciblée
    if (typeof isMenuValidate !== "boolean") {
        return res.status(400).json({ success: false, message: "isMenuValidate doit être un booléen." });
    }
    menu.isMenuValidate = isMenuValidate;

    // Garantir que l'auteur courant est listé
    if (userId && !(menu.authors || []).map(a => a.toString()).includes(userId)) {
        menu.authors.push(userId);
    }

    await menu.save();

    // Historique (optionnel)
    // await MenuHistory.create({
    //   entity: menu._id,
    //   entityType: "menu",
    //   action: "toggle-validation",
    //   author: userId,
    //   date: new Date(),
    //   changes: { before, after: { isMenuValidate: menu.isMenuValidate } },
    // });

    // Retour avec population utile
    const updated = await Menu.findById(menu._id)
        .populate('service')
        .populate('authors', 'firstname lastname role');

    return res.status(200).json({
        success: true,
        message: "Validation du menu mise à jour.",
        data: updated
    });
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
        return res.status(400).json({
            success: false,
            message: "ID de menu invalide."
        });
    }

    const menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({
            success: false,
            message: "Menu non trouvé."
        });
    }

    // Vérification des droits (co-auteur, manager, admin)
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (menu.authors && menu.authors.map(a => a.toString()).includes(req.user.id));

    if (!isAllowed) {
        return res.status(403).json({
            success: false,
            message: "Accès refusé."
        });
    }

    // Traçabilité : log de suppression avant suppression effective
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        action: "delete",
        author: req.user.id,
        date: new Date(),
        changes: {
            sections: menu.sections,
            productionAssignment: menu.productionAssignment,
            isRestaurant: menu.isRestaurant
        },
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
        success: true,
        message: "Menu supprimé avec succès."
    });
});

/**
 * @desc    Mettre à jour uniquement la répartition des productions
 * @route   PATCH /api/menus/:id/production-assignment
 * @method  PATCH
 * @access  Privé (co-auteur, manager, admin)
 */
const updateProductionAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { productionAssignment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID de menu invalide."
        });
    }

    if (!productionAssignment || !productionAssignment.cuisine || !productionAssignment.service) {
        return res.status(400).json({
            success: false,
            message: "Structure productionAssignment invalide. Doit contenir {cuisine: [], service: []}"
        });
    }

    const menu = await Menu.findById(id);
    if (!menu) {
        return res.status(404).json({
            success: false,
            message: "Menu non trouvé."
        });
    }

    // Vérification des droits
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (menu.authors && menu.authors.map(a => a.toString()).includes(req.user.id));

    if (!isAllowed) {
        return res.status(403).json({
            success: false,
            message: "Accès refusé."
        });
    }

    // Sauvegarde ancienne répartition pour traçabilité
    const oldAssignment = menu.productionAssignment ?
        JSON.parse(JSON.stringify(menu.productionAssignment)) : null;

    // Mise à jour
    menu.productionAssignment = productionAssignment;
    await menu.save();

    // Traçabilité
    await MenuHistory.create({
        entity: menu._id,
        entityType: "menu",
        action: "update_assignment",
        author: req.user.id,
        date: new Date(),
        changes: {
            before: oldAssignment,
            after: productionAssignment
        },
        comment: "Modification de la répartition des productions"
    });

    // Récupérer le menu mis à jour
    const updatedMenu = await Menu.findById(menu._id)
        .populate('service')
        .populate({
            path: 'sections.AB sections.Entrée sections.Plat sections.Fromage sections.Dessert sections.Boisson',
            model: 'Item'
        })
        .populate('authors', 'firstname lastname role');

    res.status(200).json({
        success: true,
        message: "Répartition des productions mise à jour",
        data: updatedMenu
    });
});

module.exports = {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    patchMenuSection,
    updateProductionAssignment,
    patchMenuValidation
};