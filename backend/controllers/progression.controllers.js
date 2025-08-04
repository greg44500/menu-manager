const asyncHandler = require('express-async-handler');
const Progression = require('../models/progression.model');
const Service = require('../models/service.model');
const Classroom = require('../models/classroom.model');
const Calendar = require('../models/calendar.model')
const User = require('../models/user.model');
const {
  validateObjectId
} = require('../helpers/user.helper');
const { getMondayFromISOWeek } = require('../utils/dateUtils')


//** @desc    Créer une nouvelle progression avec génération automatique des services
//** @route   POST /api/progressions
//** @access  Admin / Manager (via middleware)

const createProgression = asyncHandler(async (req, res) => {
  // Désormais, on reçoit weekList (tableau d'objets { weekNumber, year })
  const { title, classrooms, teachers, weekList, calendar } = req.body;

  // Validation des champs
  if (!title?.length || !classrooms?.length || !weekList?.length) {
    res.status(400);
    throw new Error('Titre, classes et semaines sont requis.');
  }
  if (!calendar) {
    res.status(400);
    throw new Error('Le champ calendar (session) est requis.');
  }

  // Vérifier la non-duplication
  const existingProgression = await Progression.findOne({ title });
  if (existingProgression) {
    res.status(400);
    throw new Error('Une progression avec ce titre existe déjà.');
  }

  // Récupération du calendrier (pour vérif et limites)
  const calendarDoc = await Calendar.findById(calendar);
  if (!calendarDoc) {
    res.status(404);
    throw new Error('Calendrier introuvable.');
  }

  // Création des services à partir du couple (weekNumber, year)
  const createdServices = await Promise.all(
    weekList.map(async ({ weekNumber, year }) => {
      // Calcule le lundi de la semaine
      const monday = getMondayFromISOWeek(weekNumber, year);

      // Vérifie l'inclusion dans l'intervalle du calendrier
      if (
        monday < new Date(calendarDoc.startDate) ||
        monday > new Date(calendarDoc.endDate)
      ) {
        throw new Error(`La semaine ${weekNumber} (${year}) est hors de la session active`);
      }

      // Crée le service
      const newService = await Service.create({
        weekNumber,
        year,
        serviceDate: monday,
        classrooms,
        teachers: teachers || [],
        calendar,
      });

      // Retourne l'objet à stocker dans la progression
      return {
        weekNumber,
        year,
        service: newService._id,
      };
    })
  );

  // Création de la progression
  const progression = await Progression.create({
    title,
    classrooms,
    teachers: teachers || [],
    weekList,
    services: createdServices,
    calendar
  });

  // Gestion des assignations classes / formateurs (comme avant)
  // ...
  res.status(201).json(progression);
});



// ===========================================================
// @desc    Modifier une progression
// @route   PUT /api/progressions/:id
// @access  superAdmin / Manager (via middleware)
// ===========================================================

const updateProgression = asyncHandler(async (req, res) => {
  // Extraction des champs depuis la requête
  const { title, classrooms, teachers, weekList } = req.body;
  const { id } = req.params;

  // Recherche la progression à modifier
  const progression = await Progression.findById(id);
  if (!progression) {
    res.status(404);
    throw new Error('Progression non trouvée');
  }

  // Validation des champs principaux
  if (!title?.length || !classrooms?.length || !weekList?.length) {
    res.status(400);
    throw new Error('Titre, classes et semaines sont requis.');
  }

  // Récupère le calendrier lié à la progression pour la validation des dates
  const calendarDoc = await Calendar.findById(progression.calendar);
  if (!calendarDoc) {
    res.status(404);
    throw new Error("Calendrier introuvable pour cette progression");
  }

  // Mise à jour des champs principaux
  progression.title = title;
  progression.classrooms = classrooms;
  progression.teachers = Array.isArray(teachers) ? teachers : [];
  progression.weekList = weekList;

  // --- Gestion de la synchronisation des services ---

  // Clé composite pour identifier chaque semaine
  const formatKey = (w) => `${w.weekNumber}-${w.year}`;

  // Extraction des clés des anciens et nouveaux services
  const oldServiceKeys = (progression.services || []).map(s => formatKey(s));
  const newServiceKeys = weekList.map(w => formatKey(w));

  // --- Suppression des services qui ne sont plus dans weekList ---
  const servicesToRemove = (progression.services || []).filter(
    s => !newServiceKeys.includes(formatKey(s))
  );
  if (servicesToRemove.length > 0) {
    // Suppression effective en base
    await Service.deleteMany({
      _id: { $in: servicesToRemove.map(s => s.service) }
    });
    // Nettoyage du tableau services dans la progression
    progression.services = progression.services.filter(
      s => newServiceKeys.includes(formatKey(s))
    );
  }

  // --- Ajout des nouveaux services absents de l'ancienne liste ---
  const existingServiceKeys = (progression.services || []).map(s => formatKey(s));
  const servicesToAdd = weekList.filter(
    w => !existingServiceKeys.includes(formatKey(w))
  );

  for (const weekObj of servicesToAdd) {
    const { weekNumber, year } = weekObj;
    // Calcule la date du lundi de la semaine
    const monday = getMondayFromISOWeek(weekNumber, year);

    // Validation : vérifie que la semaine appartient bien au calendrier/session
    if (
      monday < new Date(calendarDoc.startDate) ||
      monday > new Date(calendarDoc.endDate)
    ) {
      continue; // Ignore ou log l'info si nécessaire
    }

    // Création du service en base
    const newService = await Service.create({
      weekNumber,
      year,
      serviceDate: monday,
      classrooms,
      teachers: teachers || [],
      calendar: progression.calendar,
    });

    // Ajoute la référence à la progression
    progression.services.push({
      weekNumber,
      year,
      service: newService._id,
    });
  }

  // --- Mise à jour en masse des services restants (classes/formateurs) ---
  await Service.updateMany(
    { _id: { $in: progression.services.map((s) => s.service) } },
    {
      $set: {
        teachers: teachers || [],
        classrooms: classrooms || [],
      },
    }
  );

  // Enregistre la progression mise à jour
  await progression.save();

  // Recharge pour réponse enrichie
  const updatedProgression = await Progression.findById(progression._id)
    .populate('teachers', 'firstname lastname email specialization')
    .populate('classrooms', 'name');

  res.status(200).json({
    message: 'Progression mise à jour avec succès',
    progression: updatedProgression,
  });
});

// **@desc    Supprimer une progression par ID
// **@route   DELETE /api/progressions/:id
// **@access  Admin uniquement (géré par middleware)
const deleteOneProgression = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;

  // Vérifier si la progression existe
  const progression = await Progression.findById(id);
  if (!progression) {
    res.status(404);
    throw new Error('Progression non trouvée');
  }

  // Suppression des services liés à la progression
  await Service.deleteMany({
    _id: {
      $in: progression.services.map(s => s.service)
    }
  });

  // Mise à jour des formateurs et classes pour retirer la progression
  await Classroom.updateMany({
    _id: {
      $in: progression.classrooms
    }
  }, {
    $pull: {
      assignedProgressions: id
    }
  });

  await User.updateMany({
    _id: {
      $in: progression.teachers
    }
  }, {
    $pull: {
      assignedProgressions: id
    }
  });

  // Suppression de la progression
  await progression.deleteOne();

  res.status(200).json({
    message: 'Progression supprimée avec succès'
  });
});

// **@desc    Supprimer toutes les progressions - RAZ
// **@route   DELETE /api/progressions
// **@access  Admin uniquement (géré par middleware)
const deleteAllProgressions = asyncHandler(async (req, res) => {
  // Suppression de tous les services liés aux progressions
  await Service.deleteMany({});

  // Suppression des progressions
  await Progression.deleteMany({});

  // Mise à jour des formateurs et classes pour supprimer toutes les progressions assignées
  await Classroom.updateMany({}, {
    $set: {
      assignedProgressions: []
    }
  });
  await User.updateMany({}, {
    $set: {
      assignedProgressions: []
    }
  });

  res.status(200).json({
    message: 'Toutes les progressions ont été supprimées'
  });
});

// @desc    Obtenir une progression par ID
// @route   GET /api/progressions/:id
// @access  Admin, Manager, Formateur assigné
const getProgressionById = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const progression = await Progression.findById(id)
    .populate('classrooms', 'virtualName') //Identifie le nom de la classe (nom virtuel ajouter .lean({virtual: true}))
    .populate('teachers', 'firstname lastname email specialization')
    .populate('services.service', 'type date')
    .populate({
      path: 'services', //
      select: 'items isMenuValidate isRestaurant author'
    })
    .lean({ virtuals: true }); // ← Active les champs virtuels comme virtualName

  if (!progression) {
    res.status(404);
    throw new Error("Progression non trouvée");
  }

  res.status(200).json(progression);
});

// @desc    Obtenir toutes les progressions (filtrable par calendarId)
// @route   GET /api/progressions?calendarId=xxxx
// @access  Admin, Manager
const getAllProgressions = asyncHandler(async (req, res) => {
  // Récupère le paramètre de query ?calendarId=xxxx
  const { calendarId } = req.query;

  // Prépare le filtre selon la présence du paramètre
  const filter = {};
  if (calendarId) {
    filter.calendar = calendarId;
  }

  const progressions = await Progression.find(filter)
    .populate({
      path: 'classrooms',
      select: 'diploma category alternationNumber group certificationSession',
    })
    .populate('teachers', 'firstname lastname email specialization')
    .populate('services.service', 'type date')
    .populate({
      path: 'services',
      select: 'items isMenuValidate isRestaurant author'
    })
    .lean({ virtuals: true }); // ← Active les champs virtuels comme virtualName

  res.status(200).json({
    success: true,
    count: progressions.length,
    data: progressions.length ? progressions : []
  });
});

// @desc    Obtenir les progressions par classe
// @route   GET /api/progressions/classroom/:classroomId
// @access  Admin, Manager, Formateur assigné
const getProgressionsByClassroom = asyncHandler(async (req, res) => {
  const {
    classroomId
  } = req.params;

  const progressions = await Progression.find({
    classrooms: classroomId
  })
    .populate('classrooms', 'virtualName')
    .populate('teachers', 'firstname lastname email specialization')
    .populate('services.service', 'type date')
    .populate({
      path: 'services',
      select: 'items isMenuValidate isRestaurant author'
    })
    .lean({ virtuals: true }); // ← Active les champs virtuels comme virtualName

  if (!progressions.length) {
    res.status(404);
    throw new Error("Aucune progression trouvée pour cette classe");
  }

  res.status(200).json(progressions);
});

// @desc    Obtenir les progressions par formateur
// @route   GET /api/progressions/teacher/:teacherId
// @access  Admin, Manager, Formateur assigné
const getProgressionsByTeacher = asyncHandler(async (req, res) => {
  const {
    teacherId
  } = req.params;

  const progressions = await Progression.find({
    teachers: teacherId
  })
    .populate('classrooms', 'virtualName')
    .populate('teachers', 'firstname lastname email specialization')
    .populate('services.service', 'type date')
    .populate({
      path: 'services',
      select: 'items isMenuValidate isRestaurant author'
    })


  if (!progressions.length) {
    res.status(404);
    throw new Error("Aucune progression trouvée pour ce formateur");
  }

  res.status(200).json(progressions);
});

// @desc    Assigner des formateurs à une progression existante
// @route   PUT /api/progressions/:id/assign-teachers
// @access  Admin, Manager
const assignTeachersToProgression = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teachers } = req.body;

  if (!Array.isArray(teachers)) {
    res.status(400);
    throw new Error("Les formateurs doivent être fournis sous forme de tableau.");
  }

  const progression = await Progression.findById(id);
  if (!progression) {
    res.status(404);
    throw new Error("Progression non trouvée.");
  }

  const classrooms = progression.classrooms;

  // Nettoyer les anciens formateurs
  await Classroom.updateMany(
    { _id: { $in: classrooms } },
    { $pull: { assignedTeachers: { $in: progression.teachers } } }
  );
  await User.updateMany(
    { _id: { $in: progression.teachers } },
    {
      $pull: {
        assignedClassrooms: { $in: classrooms },
        assignedProgressions: id,
      },
    }
  );
  await Service.updateMany(
    { _id: { $in: progression.services.map(s => s.service) } },
    { $set: { teachers: teachers } }
  );

  // Ajouter les nouveaux formateurs
  if (teachers.length) {
    await Classroom.updateMany(
      { _id: { $in: classrooms } },
      { $addToSet: { assignedTeachers: { $each: teachers } } }
    );
    await User.updateMany(
      { _id: { $in: teachers } },
      {
        $addToSet: {
          assignedClassrooms: { $each: classrooms },
          assignedProgressions: id,
        },
      }
    );
  }

  // Mise à jour de la progression
  progression.teachers = teachers;
  await progression.save();

  // 👇 Important : récupérer les infos des enseignants
  await progression.populate('teachers');
  console.log('✅ Teachers enregistrés dans progression:', progression.teachers);
  res.status(200).json({
    message: "Formateurs assignés avec succès",
    progression,
  });
});


module.exports = {
  createProgression,
  updateProgression,
  deleteOneProgression,
  deleteAllProgressions,
  getProgressionById,
  getAllProgressions,
  getProgressionsByClassroom,
  getProgressionsByTeacher,
  assignTeachersToProgression
}