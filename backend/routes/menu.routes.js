// backend/routes/menu.routes.js
const express = require('express');
const router = express.Router();
const {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    patchMenuSection,
    updateProductionAssignment,
    patchMenuValidation,
} = require('../controllers/menu.controllers');

const {
    authenticateUser,
    onlySuperAdmin,
    onlyManagerOrSuperAdmin,
    canEditMenuItems
} = require('../middlewares/auth.middlewares');

const History = require("../models/history.model");

/**
 * @route   POST /api/menus
 * @desc    Créer un nouveau menu (seuls les utilisateurs authentifiés peuvent créer)
 * @access  Privé (users, managers, superAdmin)
 */
router.post('/', authenticateUser, createMenu);

/**
 * @route   GET /api/menus
 * @desc    Récupérer tous les menus
 * @access  Privé (tous rôles connectés)
 */
router.get('/', authenticateUser, getAllMenus);

/**
 * @route   GET /api/menus/:id
 * @desc    Récupérer un menu par son ID
 * @access  Privé (tous rôles connectés)
 */
router.get('/:id', authenticateUser, getMenuById);

/**
 * @route   PUT /api/menus/:id
 * @desc    Modifier les paramètres d'un menu (sections, isRestaurant, productionAssignment)
 * @access  Privé (co-auteurs, managers et superAdmin)
 */
router.put('/:id', authenticateUser, updateMenu); // Pas de middleware onlyManagerOrSuperAdmin car les co-auteurs peuvent modifier

/**
 * @route   DELETE /api/menus/:id
 * @desc    Supprimer un menu
 * @access  Privé (co-auteurs, managers et superAdmin)
 */
router.delete('/:id', authenticateUser, deleteMenu); // Vérification des droits dans le controller

/**
 * @route   PATCH /api/menus/:id/sections/:sectionKey
 * @desc    Mettre à jour une section précise d'un menu
 * @method  PATCH
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 * @body    { items: Array<ObjectId>, updateAssignment?: Boolean, columnType?: 'cuisine'|'service' }
 * @returns Menu mis à jour avec historique des modifications
 */
router.patch('/:id/sections/:sectionKey', authenticateUser, patchMenuSection);

/**
 * @route   PATCH /api/menus/:id/production-assignment
 * @desc    Mettre à jour uniquement la répartition des productions (cuisine/service)
 * @method  PATCH
 * @access  Privé (co-auteurs, managers et superAdmin)
 * @body    { productionAssignment: { cuisine: string[], service: string[] } }
 * @returns Menu mis à jour avec la nouvelle répartition
 */
router.patch('/:id/production-assignment', authenticateUser, updateProductionAssignment);

/**
 * @route   PATCH /api/menus/:id/
 * @desc    Mettre à jour uniquement la validation du menu 
 * @method  PATCH
 * @access  Privé (co-auteurs, managers et superAdmin)
 * @body    { isMenuValidate: { true | false } }
 * @returns Menu mis à jour avec la validation
 */
router.patch('/:id/', authenticateUser, patchMenuValidation);

/**
 * @route   GET /api/menus/:id/history
 * @desc    Récupérer l'historique complet d'un menu
 * @access  Privé (tous rôles connectés)
 */
router.get(
    '/:id/history',
    authenticateUser,
    async (req, res) => {
        try {
            const { id } = req.params;
            const logs = await History.find({
                entityType: "menu",
                entity: id
            })
                .populate("author", "firstname lastname email role")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs.length ? logs : []
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Erreur récupération historique",
                error: err.message
            });
        }
    }
);

module.exports = router;