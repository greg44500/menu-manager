const mongoose = require('mongoose');

/**
 * @desc   Modèle générique pour la traçabilité et l'historique
 *         Utilisable pour tous types d'entités (item, menu, etc.)
 *         Les champs entityType et entity permettent de logguer dynamiquement la ressource concernée.
 */

const historySchema = new mongoose.Schema({
    entityType: {
        type: String,
        enum: ["item", "menu"], // Tu pourras ajouter d'autres types plus tard
        required: true
    },
    entity: { // Référence polymorphique (item, menu, etc.)
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        enum: ["create", "update", "delete"],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: { type: Date, default: Date.now },
    changes: { type: Object },   // Peut contenir le diff (avant/après, ou état complet)
    comment: { type: String }    // Utilisé pour logs, validation, etc.
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
