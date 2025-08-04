const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Item = require("../models/item.model");
const normalizeName = require("../helpers/normalizeName");
const { isValidObjectId } = require("../helpers/user.helper");
const UserModel = require("../models/user.model");
// Ajout du modèle d'historique pour le suivi et la traçabilité
const ItemHistory = require("../models/history.model");

/**
 * @desc    Créer un nouvel item (unicité avancée sur nom, normalisation et singulier/pluriel)
 * @route   POST /api/items
 * @method  POST
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 */
const createItem = asyncHandler(async (req, res) => {
    // === 1. Extraction et vérification des champs requis ===
    const { name, category } = req.body;

    if (!name || !category) {
        res.status(400);
        throw new Error("Tous les champs sont requis.");
    }

    // === 2. Normalisation du nom (casse, accents, espaces, pluriel) via helper ===
    const nameNormalized = normalizeName(name);

    // === 3. Vérification unicité sur le champ normalisé ===
    const itemExists = await Item.findOne({ nameNormalized });
    if (itemExists) {
        res.status(400);
        throw new Error(
            "Cet item existe déjà (même nom, insensible à la casse, aux accents, au pluriel et aux espaces)."
        );
    }

    // === 4. Création de l'item (enregistrement du nom normalisé pour les futures vérifications) ===
    const item = await Item.create({
        name: name.trim(),
        nameNormalized,
        category,
        authors: [req.user.id],
    });

    // === 5. Mise à jour de l'historique de l'utilisateur ===
    await UserModel.findByIdAndUpdate(req.user.id, {
        $push: { createdItemsMenus: item._id },
    });

    // === 6. Traçabilité : log dans ItemHistory (pour audit/rollback) ===
    await ItemHistory.create({
        entity: item._id,
        entityType: "item",
        action: "create",
        author: req.user.id,
        date: new Date(),
        changes: { ...item._doc },
        comment: "Création de l'item",
    });

    // === 7. Réponse à l'API (succès) ===
    res.status(201).json(item);
});

/**
 * @desc    Récupérer tous les items
 * @route   GET /api/items
 * @method  GET
 * @access  Public (tous rôles)
 * ----------- Bloc récupération globale -----------
 */
const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().sort({ createdAt: -1 }).populate("authors");
    res.status(200).json({
        success: true,
        count: items.length,
        data: items.length ? items : "Rien à afficher"
    });
});

/**
 * @desc    Récupérer tous les items créés par l'utilisateur courant
 * @route   GET /api/items/mine
 * @method  GET
 * @access  Privé (tous rôles connectés)
 * ----------- Bloc récupération user -----------
 */
const getItemsByUsers = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const items = await Item.find({
        authors: userId
    }).sort({ createdAt: -1 }).populate('authors');
    res.status(200).json({
        success: true,
        count: items.length,
        data: items.length ? items : "Rien à afficher"
    });
});

/**
 * @desc    Récupérer un item spécifique par ID
 * @route   GET /api/items/:id
 * @method  GET
 * @access  Public (tous rôles)
 * ----------- Bloc récupération par ID -----------
 */
const getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(400);
        throw new Error("ID invalide.");
    }
    const item = await Item.findById(id).populate("authors");
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }
    res.status(200).json(item);
});

/**
 * @desc    Modifier un item (seul un co-auteur, manager ou admin peut le faire)
 * @route   PUT /api/items/:id
 * @method  PUT
 * @access  Privé (co-auteur, manager, admin)
 * ----------- Bloc modification -----------
 */
const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID invalide"
        });
    }

    let item = await Item.findById(id);
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }

    // Vérification des droits d'édition : admin, manager, ou co-auteur
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (item.authors && item.authors.map(a => a.toString()).includes(req.user.id));
    if (!isAllowed) {
        res.status(403);
        throw new Error("Accès refusé.");
    }

    // Vérifier l'unicité du nouveau nom si changé
    if (name && name.trim() !== item.name) {
        const itemExists = await Item.findOne({ name: name.trim() });
        if (itemExists) {
            res.status(400);
            throw new Error("Un item avec ce nom existe déjà.");
        }
    }

    // Pour la traçabilité, conserver l'état avant modification
    const oldItem = { ...item._doc };

    item.name = name ? name.trim() : item.name;
    item.category = category || item.category;
    item = await item.save();

    // Traçabilité : log de modification dans ItemHistory
    await ItemHistory.create({
        entity: item._id,
        entityType: "item",
        action: "update",
        author: req.user.id,
        date: new Date(),
        changes: { before: oldItem, after: { ...item._doc } },
        comment: "Modification de l'item"
    });

    res.status(200).json(item);
});

/**
 * @desc    Supprime un item (superAdmin, manager ou co-auteur uniquement)
 * @route   DELETE /api/items/:id
 * @access  Privé (superAdmin, manager, co-auteur)
 */
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Validation de l'ID MongoDB
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "ID d'item invalide." });
    }

    // 2. Recherche de l'item à supprimer
    const item = await Item.findById(id);
    if (!item) {
        return res.status(404).json({ message: "Item non trouvé." });
    }

    // 3. Vérification des droits : superAdmin, manager ou co-auteur
    const currentUserId = req.user.id?.toString() || req.user._id?.toString();
    const isCoAuthor = Array.isArray(item.authors) && item.authors.some(authorId =>
        authorId?.toString() === currentUserId
    );
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        isCoAuthor;

    if (!isAllowed) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
    }

    // 4. Historique : log avant suppression effective (erreur non bloquante)
    try {
        await ItemHistory.create({
            entity: item._id,
            entityType: "item",
            action: "delete",
            author: currentUserId,
            date: new Date(),
            changes: { ...item._doc },
            comment: "Suppression de l'item"
        });
    } catch (err) {
        // Le log d'historique ne doit pas bloquer la suppression : log côté serveur
        console.error(`[ItemHistory] Erreur lors du log de suppression (item ${id}):`, err);
    }

    // 5. Suppression effective de l'item
    try {
        await item.deleteOne();
        return res.status(200).json({ message: "Item supprimé avec succès." });
    } catch (err) {
        console.error(`[Item] Erreur lors de la suppression (item ${id}):`, err);
        return res.status(500).json({ message: "Erreur serveur lors de la suppression de l'item." });
    }
});
module.exports = {
    createItem,
    getAllItems,
    getItemById,
    getItemsByUsers,
    updateItem,
    deleteItem
};
