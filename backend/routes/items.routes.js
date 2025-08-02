const express = require("express");
const {
    createItem,
    getAllItems,
    getItemById,
    getItemsByUsers,
    updateItem,
    deleteItem
} = require("../controllers/item.controllers");

const {
    authenticateUser,
    authorizeRoles,
    checkResourceAccess
} = require('../middlewares/auth.middlewares');

const Item = require('../models/item.model');
const History = require("../models/history.model");
const router = express.Router();

/**
 * @route   POST /api/items
 * @desc    Créer un nouvel item
 * @access  Privé (user, manager, superAdmin)
 */
router.post(
    "/",
    authenticateUser,
    authorizeRoles(["user", "manager", "superAdmin"]),
    createItem
);

/**
 * @route   GET /api/items
 * @desc    Liste de tous les items
 * @access  Privé (tous rôles)
 */
router.get("/", authenticateUser, getAllItems);

/**
 * @route   GET /api/items/mine
 * @desc    Liste des items de l'utilisateur courant
 * @access  Privé (tous rôles)
 */
router.get("/mine", authenticateUser, getItemsByUsers);

/**
 * @route   GET /api/items/:id
 * @desc    Détail d'un item par ID
 * @access  Privé (tous rôles)
 */
router.get("/:id", authenticateUser, getItemById);

/**
 * @route   PUT /api/items/:id
 * @desc    Modifier un item (seul un co-auteur, manager ou superAdmin)
 * @access  Privé (user, manager, superAdmin)
 */
router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(["user", "manager", "superAdmin"]),
    checkResourceAccess(Item),
    updateItem
);

/**
 * @route   DELETE /api/items/:id
 * @desc    Supprimer un item (seul superAdmin)
 * @access  Privé (superAdmin uniquement)
 */
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(["superAdmin"]),
    checkResourceAccess(Item),
    deleteItem
);

/**
 * @route   GET /api/items/:id/history
 * @desc    Récupérer l'historique complet d'un item (créations, modifications, suppressions)
 * @access  Privé (tous rôles)
 */
router.get(
    "/:id/history",
    authenticateUser,
    async (req, res) => {
        try {
            const { id } = req.params;
            // Optionnel : tu peux vérifier ici les droits avec checkResourceAccess si besoin
            const logs = await History.find({
                entityType: "item",
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

module.exports = router;
