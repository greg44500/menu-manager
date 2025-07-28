const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true, // Numéro ISO de la semaine
    },
    year: {
        type: Number,
        required: true, // Année civile associée à la semaine
    },
    serviceDate: {
        type: Date,
        default: Date.now,
        required: true, // Date exacte du lundi de la semaine ISO
    },
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeService',
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
    },
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        default: null
    },
    isRestaurantOpen: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
