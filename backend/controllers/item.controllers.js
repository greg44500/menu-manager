const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Item = require("../models/item.model");
const { validateObjectId } = require("../helpers/user.helper");
const UserModel = require("../models/user.model");
// Ajout du modèle d'historique pour le suivi et la traçabilité
const ItemHistory = require("../models/history.model");

/**
 * @desc    Créer un nouvel item (unique)
 * @route   POST /api/items
 * @method  POST
 * @access  Privé (formateur assigné/remplaçant, manager, admin)
 * ----------- Bloc création item -----------
 */
const createItem = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    // Vérification des champs obligatoires
    if (!name || !category) {
        res.status(400);
        throw new Error("Tous les champs sont requis.");
    }

    // Vérifier l'unicité de l'item
    const itemExists = await Item.findOne({ name: name.trim() });
    if (itemExists) {
        res.status(400);
        throw new Error("Cet item existe déjà.");
    }

    // Création de l'item avec gestion co-auteurs (toujours tableau)
    const item = await Item.create({
        name: name.trim(),
        category,
        authors: [req.user.id]
    });

    // Ajout de l'item à l'historique du user
    await UserModel.findByIdAndUpdate(
        req.user.id,
        { $push: { createdItemsMenus: item._id } }
    );

    // Traçabilité : log de création dans ItemHistory
    await ItemHistory.create({
        entity: item._id,
        entityType: "item",
        action: "create",
        author: req.user.id,
        date: new Date(),
        changes: { ...item._doc },
        comment: "Création de l'item"
    });

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
    if (!validateObjectId(id)) {
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
 * @desc    Supprimer un item (seul un admin, manager ou co-auteur peut le faire)
 * @route   DELETE /api/items/:id
 * @method  DELETE
 * @access  Privé (admin, manager, co-auteur)
 * ----------- Bloc suppression -----------
 */
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        res.status(400);
        throw new Error("ID invalide.");
    }
    const item = await Item.findById(id);
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }

    // Vérification des droits de suppression
    const isAllowed =
        req.user.role === "superAdmin" ||
        req.user.role === "manager" ||
        (item.authors && item.authors.map(a => a.toString()).includes(req.user.id));
    if (!isAllowed) {
        res.status(403);
        throw new Error("Accès refusé.");
    }

    // Traçabilité : log de suppression avant la suppression effective
    await ItemHistory.create({
        entity: item._id,
        entityType: "item",
        action: "delete",
        author: req.user.id,
        date: new Date(),
        changes: { ...item._doc },
        comment: "Suppression de l'item"
    });

    await item.deleteOne();
    res.status(200).json({
        message: "Item supprimé avec succès."
    });
});

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    getItemsByUsers,
    updateItem,
    deleteItem
};
