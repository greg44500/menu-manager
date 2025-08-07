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
} = require('../controllers/menu.controllers');

const {
    authenticateUser,
    onlySuperAdmin,
    onlyManagerOrSuperAdmin,
    canEditMenuItems // prêt pour plus tard (si tu ajoutes des routes d'édition des items d'un menu)
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
 * @desc    Modifier les paramètres d’un menu
 * @access  Privé (seuls managers et superAdmin)
 */
router.put('/:id', authenticateUser, onlyManagerOrSuperAdmin, updateMenu);

/**
 * @route   DELETE /api/menus/:id
 * @desc    Supprimer un menu
 * @access  Privé (seul superAdmin)
 */
router.delete('/:id', authenticateUser, onlySuperAdmin, deleteMenu);

/**
 * @desc    Mettre à jour une section précise d’un menu (création ou modification des items de la section)
 * @route   PATCH /api/menus/:id/sections/:sectionKey
 * @method  PATCH
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 * @body    { items: Array<ObjectId> }  // Tableau d'IDs des items pour la section ciblée
 * @returns Menu mis à jour (section modifiée uniquement) avec historique des modifications
 */
router.patch('/:id/sections/:sectionKey', patchMenuSection);//{ authenticateUser, canEditMenuItems }
/**
 * @route   GET /api/menus/:id/history
 * @desc    Récupérer l'historique complet d'un menu (créations, modifications, suppressions)
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
                .populate("author", "firstName lastName email role")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs.length ? logs : "Aucune action enregistrée"
            });
        } catch (err) {
            res.status(500).json({ success: false, message: "Erreur récupération historique", error: err.message });
        }
    }
);

// Plus tard, tu pourras ajouter (par exemple) :
// router.patch('/:id/items', authenticateUser, canEditMenuItems, addItemToMenu);
// router.delete('/:id/items/:itemId', authenticateUser, canEditMenuItems, removeItemFromMenu);

module.exports = router;
