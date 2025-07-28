const mongoose = require('mongoose');
const Service = require('./service.model'); // Import du modèle Service

const progressionSchema = new mongoose.Schema({
    calendar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicCalendar',
        required: true
    },
    title: { type: String, unique: true, required: true },
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],

    // Nouvelle structure : stockage explicite année + semaine
    weekList: [{
        weekNumber: { type: Number, required: true },
        year: { type: Number, required: true }
    }],

    // Lien avec tous les services générés pour cette progression
    services: [{
        weekNumber: { type: Number, required: true },
        year: { type: Number, required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // Lien vers le Service
    }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Activer les champs virtuels lors de la conversion en JSON ou en objet
progressionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model('Progression', progressionSchema);
