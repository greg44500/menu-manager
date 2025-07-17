const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const typeService = require('../models/typeService.model');


const {
    isValidObjectId,
    canAccessOwnData
} = require('../helpers/user.helper');

// ** @desc : Create Service Type
// ** @Route : POST /api/typeServices
// ** @Access : superAdmin
const createTypeService = asyncHandler(async (req, res) => {
    const {
        name
    } = req.body;
    // Validation des champs requis
    if (!name) {

        return res.status(400).json({
            success: false,
            message: 'Tous les champs requis doivent être remplis'
        });
    }

    // Vérification de l'unicité de la ressource
    const existingtypeService = await typeService.findOne({
        name
    });
    if (existingtypeService) {
        res.status(400);
        throw new Error('Type de service déjà existant')
    }
    try {

        const newtypeService = new typeService({
            name: name.toUpperCase()
        });

        const savedTypeService = await newtypeService.save();

        return res.status(201).json({
            success: true,
            message: 'Nouveau type de Service créé avec succès',
            data: savedTypeService,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Erreur lors de la création du type de service : ${error.message}`
        });
    }
});

// ** @Desc : update typeService Name
// ** @Route : PUT /api/Service-type/:id
// ** @Access : superAdmin, manager

const updateTypeService = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Type de service invalide"));
    }

    const existingtypeService = await typeService.findById(id)
    if (!existingtypeService) {
        return next(new Error("Ressource introuvable"));
    }

    // Mise à jour des champs modifiables uniquement s'ils sont présents dans la requête
    if (name) existingtypeService.name = name.toUpperCase();

    // Sauvegarde en base de données
    await existingtypeService.save();

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Type de service mis à jour avec succès",
        data: existingtypeService
    });
})

// ** @Desc : Get One Service Type
// ** @Route : GET /api/types-servicess/:id
// ** @Access : superAdmin, manager

const getOneTypeService = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Type de service invalide"));
    }

    const existingtypeService = await typeService.findById(id)
    if (!existingtypeService) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        succress: true,
        data : existingtypeService
    });
})

// ** @Desc : Get All Service Type
// ** @Route : GET /api/types-servicess/
// ** @Access : superAdmin, manager

const getAllTypeServices = asyncHandler(async (req, res, next) => {

    const typeServices = await typeService.find()
    if (!typeServices) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
   res.status(200).json(typeServices);
})
// ** @Desc : Delete All Service Type
// ** @Route : DELETE /api/types-servicess/:id
// ** @Access : superAdmin, manager
const deleteOneTypeService = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID type de Service invalide"));
    }

    const existingtypeService = await typeService.findByIdAndDelete(id)
    if (!existingtypeService) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Type de Service supprimé avec succès",
    });
})
// ** @Desc : Delete All Service Type - RAZ
// ** @Route : DELETE /api/types-servicess/
// ** @Access : superAdmin, manager
const deleteAllTypeServices = asyncHandler(async (req, res, next) => {

    const typeServices = await typeService.deleteMany()
    if (!typeServices) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Types de service supprimés avec succès",
    });
})

module.exports = {
    createTypeService,
    updateTypeService,
    getOneTypeService,
    getAllTypeServices,
    deleteOneTypeService,
    deleteAllTypeServices
}