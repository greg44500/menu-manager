const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Empêche les doublons
        trim: true
    },
    category: {
        type: String,
        enum: ["AB", "Entrée", "Plat", "Fromage", "Dessert", "Boisson"],
        required: true
    },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, {
    timestamps: true
});


module.exports = mongoose.model("Item", itemSchema);