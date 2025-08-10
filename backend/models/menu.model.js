const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    sections: {
        AB: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        Entrée: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        Plat: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        Fromage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        Dessert: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        Boisson: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }]
    },
    productionAssignment: {
        cuisine: [String], // Ex: ['Entrée', 'Plat', 'Dessert']
        service: [String]  // Ex: ['AB', 'Boisson', 'Fromage']
    },
    isMenuValidate: {
        type: Boolean,
        default: false
    },
    isRestaurant: {
        type: Boolean,
        default: false
    },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true
});

// Met à jour la date de modification automatiquement
menuSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Menu", menuSchema);