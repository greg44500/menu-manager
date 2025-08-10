const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Progression = require('../models/progression.model');
const Service = require("../models/service.model")
const Menu = require("../models/menu.model")
const { getMondayFromWeek } = require('../utils/dateUtils')

// @desc    Obtenir tous les services enrichis d'une progression
// @route   GET /api/progressions/:progressionId/services
// @access  Admin, Manager
// @route   GET /api/progressions/:progressionId/services
const getServices = asyncHandler(async (req, res) => {
    const { progressionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(progressionId)) {
        res.status(400);
        throw new Error('ID de progression invalide');
    }

    // Récupérer la progression et les services liés
    const progression = await Progression.findById(progressionId)
        .populate({
            path: 'services.service',
            select: 'weekNumber serviceDate classrooms teachers',
            populate: [
                {
                    path: 'classrooms',
                    select: 'diploma category alternationNumber group certificationSession'
                },
                {
                    path: 'teachers',
                    select: 'firstname lastname email specialization'
                }
            ]
        })
        .lean({ virtuals: true });

    if (!progression) {
        res.status(404);
        throw new Error('Progression non trouvée');
    }


    // 1. Récupérer les IDs des services présents dans la progression
    const serviceIds = (progression.services || [])
        .filter(s => !!s.service)
        .map(s => s.service._id);

    // 2. Récupérer tous les menus associés à ces services, AVEC population des sections/items
    const menus = await Menu.find({ service: { $in: serviceIds } })
        .populate([
            { path: 'sections.AB', model: 'Item', select: 'name _id' },
            { path: 'sections.Entrée', model: 'Item', select: 'name _id' },
            { path: 'sections.Plat', model: 'Item', select: 'name _id' },
            { path: 'sections.Fromage', model: 'Item', select: 'name _id' },
            { path: 'sections.Dessert', model: 'Item', select: 'name _id' },
            { path: 'sections.Boisson', model: 'Item', select: 'name _id' },
        ])
        .lean();

    // Map serviceId -> menu enrichi
    const menuMap = {};
    menus.forEach(menu => {
        menuMap[menu.service.toString()] = menu;
    });

    // 3. Mapper les services enrichis du menu (si existe)
    const services = (progression.services || [])
        .filter(s => !!s.service)
        .map(s => ({
            _id: s.service._id,
            progressionId: progressionId,
            weekNumber: s.weekNumber,
            serviceDate: s.service.serviceDate,
            classrooms: s.service.classrooms?.map(classroom => ({
                _id: classroom._id,
                virtualName: `${classroom.diploma}-${classroom.category}-${classroom.alternationNumber}${classroom.group}-${classroom.certificationSession}`,
                diploma: classroom.diploma,
                category: classroom.category
            })) || [],
            teachers: s.service.teachers?.map(teacher => ({
                _id: teacher._id,
                firstname: teacher.firstname,
                lastname: teacher.lastname,
                fullName: `${teacher.firstname} ${teacher.lastname}`,
                specialization: teacher.specialization
            })) || [],
            menu: menuMap[s.service._id.toString()] || null, // Menu enrichi des items
        }));

    return res.status(200).json({
        success: true,
        count: services.length,
        data: services,
        progressionId: progressionId
    });
});


// ** @desc    Obtenir un service spécifique par son ID
// ** @route   GET /api/progressions/:progressionId/services/:serviceId
// ** @access  Private (Admin, Manager, User)
const getServiceById = asyncHandler(async (req, res) => {
    const {
        progressionId,
        serviceId
    } = req.params;

    // Vérifier simplement si les documents existent
    const progression = await Progression.findById(progressionId)
        .populate({
            path: 'services', //
            select: 'items isMenuValidate isRestaurant author'
        })
        .lean();
    const service = await Service.findById(serviceId);
    console.log("requete", req.params)
    res.status(200).json({
        progressionExists: !!progression,
        serviceExists: !!service,
        progressionData: progression ? {
            id: progression._id,
            servicesCount: progression.services.length
        } : null,
        serviceData: service ? {
            id: service._id,
            serviceDate: service.serviceDate,
            isRestaurant: service.isRestaurantOpen
        } : null
    });
});

// ** @desc    Mettre à jour uniquement la date d'un service
// ** @route   PATCH /api/progressions/:progressionId/services/:serviceId/date
// ** @access  Private (superAdmin & manager uniquement)
const patchServiceDate = asyncHandler(async (req, res) => {
    const { progressionId, serviceId } = req.params
    const { serviceDate } = req.body

    if (!serviceDate) {
        return res.status(400).json({ success: false, message: "serviceDate est requis" })
    }

    // 1) progression existe ?
    const progression = await Progression.findById(progressionId)
    if (!progression) {
        res.status(404)
        throw new Error("Progression non trouvée")
    }

    // 2) service lié à la progression ?
    const serviceExists = progression.services.some(s => s.service.toString() === serviceId)
    if (!serviceExists) {
        res.status(404)
        throw new Error("Service non trouvé dans cette progression")
    }

    // 3) normaliser heure pour éviter décalages (optionnel)
    const d = new Date(serviceDate)
    if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: "serviceDate invalide" })
    }
    d.setHours(12, 0, 0, 0)

    // 4) update ciblé
    const updated = await Service.findByIdAndUpdate(
        serviceId,
        { $set: { serviceDate: d.toISOString() } },
        { new: true, runValidators: true }
    )

    if (!updated) {
        res.status(404)
        throw new Error("Service introuvable")
    }

    console.log("✅ serviceDate mis à jour :", { id: updated._id, serviceDate: updated.serviceDate })
    return res.status(200).json({ success: true, data: updated })
})

// ** @desc    Modifier un service (Admin) ou un menu (User)
// ** @route   PUT /api/progressions/:progressionId/services/:serviceId
// ** @access  Private (User → menu uniquement, Admin → tout)
const updateServiceOrMenu = asyncHandler(async (req, res) => {
    const {
        progressionId,
        serviceId
    } = req.params;
    const {
        role
    } = req.user; // Rôle récupéré via le middleware
    const updateData = req.body;


    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérifier si le service appartient bien à cette progression
    const serviceExists = progression.services.some(
        (s) => s.service.toString() === serviceId
    );
    if (!serviceExists) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // 🔹 Si l'utilisateur est admin, il peut modifier toutes les infos du service
    if (role === "superAdmin") {
        const updatedService = await Service.findByIdAndUpdate(serviceId, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedService) {
            res.status(404);
            throw new Error("Service introuvable");
        }

        console.log("✅ Service mis à jour :", updatedService);
        return res.status(200).json(updatedService);
    }

    // 🔹 Si l'utilisateur est un user, il ne peut modifier que le menu
    if (role === "user") {
        const {
            items
        } = updateData;

        let menu = await Menu.findOne({
            service: serviceId
        });

        if (!menu) {
            // Si aucun menu n'existe, on en crée un nouveau
            menu = new Menu({
                service: serviceId,
                items: items || [],
                author: req.user._id
            });
        } else {
            // Si un menu existe déjà, on met à jour uniquement les items
            menu.items = items || [];
        }

        const updatedMenu = await menu.save();
        console.log("✅ Menu mis à jour :", updatedMenu);
        console.log("📥 Requête reçue pour update service", req.params, req.body);
        return res.status(200).json(updatedMenu);
    }

    res.status(403);
    throw new Error("Accès interdit");
});

// ** @desc    Supprimer un service spécifique et son menu associé
// ** @route   DELETE /api/progressions/:progressionId/services/:serviceId
// ** @access  Private (Admin uniquement)

const deleteService = asyncHandler(async (req, res) => {
    const {
        progressionId,
        serviceId
    } = req.params;
    const {
        role
    } = req.user;

    // Vérification du rôle administrateur
    if (role !== "superAdmin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérifier si le service appartient à cette progression
    const serviceIndex = progression.services.findIndex(
        (s) => s.service.toString() === serviceId
    );

    if (serviceIndex === -1) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // Supprimer le service de l'array services dans la progression
    progression.services.splice(serviceIndex, 1);
    await progression.save();

    // Supprimer le service de la collection Service
    const deletedService = await Service.findByIdAndDelete(serviceId);
    if (!deletedService) {
        res.status(404);
        throw new Error("Service introuvable");
    }

    // Supprimer le menu associé au service
    await Menu.deleteOne({
        service: serviceId
    });

    return res.status(200).json({
        success: true,
        message: "Service et menu associé supprimés avec succès"
    });
});


// ** @desc    Supprimer un menu spécifique
// ** @route   DELETE /api/services/:progressionId/services/:serviceId/menu
// ** @access  Private (Admin uniquement)

const deleteMenu = asyncHandler(async (req, res) => {
    const {
        progressionId,
        serviceId
    } = req.params;
    const {
        role
    } = req.user;

    // Vérification du rôle administrateur
    if (role !== "superAdmin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérifier si le service appartient à cette progression
    const serviceExists = progression.services.some(
        (s) => s.service.toString() === serviceId
    );

    if (!serviceExists) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // Supprimer le menu associé au service
    const deletedMenu = await Menu.findOneAndDelete({
        service: serviceId
    });

    if (!deletedMenu) {
        res.status(404);
        throw new Error("Menu introuvable pour ce service");
    }

    return res.status(200).json({
        success: true,
        message: "Menu supprimé avec succès"
    });
});


// ** @desc    Supprimer tous les services et menus d'une progression
// ** @route   DELETE /api/progressions/:progressionId/services
// ** @access  Private (Admin uniquement)

const deleteAllServicesForProgression = asyncHandler(async (req, res) => {
    const {
        progressionId
    } = req.params;
    const {
        role
    } = req.user;

    // Vérification du rôle administrateur
    if (role !== "superAdmin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Récupérer les IDs de tous les services associés à cette progression
    const serviceIds = progression.services.map(s => s.service);

    // Supprimer tous les menus associés à ces services
    const deletedMenusResult = await Menu.deleteMany({
        service: {
            $in: serviceIds
        }
    });

    // Supprimer tous les services
    const deletedServicesResult = await Service.deleteMany({
        _id: {
            $in: serviceIds
        }
    });

    // Vider le tableau de services dans la progression
    progression.services = [];
    await progression.save();

    return res.status(200).json({
        success: true,
        message: "Tous les services et menus de cette progression ont été supprimés",
        details: {
            servicesSupprimes: deletedServicesResult.deletedCount,
            menusSupprimes: deletedMenusResult.deletedCount
        }
    });
});

module.exports = {
    getServices,
    getServiceById,
    updateServiceOrMenu,
    deleteService,
    deleteMenu,
    deleteAllServicesForProgression,
    patchServiceDate
}