const asyncHandler = require('express-async-handler');
const Progression = require('../models/progression.model');
const Service = require('../models/service.model');
const Classroom = require('../models/classroom.model');
const User = require('../models/user.model');
const {
  validateObjectId
} = require('../helpers/user.helper');


//** @desc    Créer une nouvelle progression avec génération automatique des services
//** @route   POST /api/progressions
//** @access  Admin / Manager (via middleware)

const createProgression = asyncHandler(async (req, res) => {
  const { title, classrooms, teachers, weekNumbers } = req.body;

  // Validation des champs obligatoires
  if (!title?.length || !classrooms?.length || !weekNumbers?.length) {
    res.status(400);
    throw new Error('Titre, classes et semaines sont requis.');
  }

  // Vérifier si une progression existe déjà avec ce titre
  const existingProgression = await Progression.findOne({ title });
  if (existingProgression) {
    res.status(400);
    throw new Error('Une progression avec ce titre existe déjà.');
  }

  // Création des services pour chaque semaine
  const createdServices = await Promise.all(
    weekNumbers.map(async (week) => {
      const newService = await Service.create({
        weekNumber: week,
        classrooms,
        teachers: teachers || [],
        menus: [],
      });

      return {
        weekNumber: week,
        service: newService._id,
        menu: [],
      };
    })
  );

  // Création de la progression
  const progression = await Progression.create({
    title,
    classrooms,
    teachers: teachers || [],
    weekNumbers,
    services: createdServices,
  });

  // Mise à jour des classes : Ajout des formateurs assignés si fournis
  if (teachers?.length) {
    await Classroom.updateMany(
      { _id: { $in: classrooms } },
      {
        $addToSet: {
          assignedTeachers: { $each: teachers },
        },
      }
    );

    // Mise à jour des formateurs : Ajout des classes et progression
    await User.updateMany(
      { _id: { $in: teachers } },
      {
        $addToSet: {
          assignedClassrooms: { $each: classrooms },
          assignedProgressions: progression._id,
        },
      }
    );
  }

  res.status(201).json(progression);
});



// ** @desc  Modifier une progression
// ** @route   PUT /api/progressions
// ** @access  Admin / Manager (via middleware)

// Modifier une progression existante
const updateProgression = asyncHandler(async (req, res) => {
  const { title, classrooms, teachers, weekNumbers } = req.body;
  const { id } = req.params;

  // Vérifier si la progression existe
  const progression = await Progression.findById(id);
  if (!progression) {
    res.status(404);
    throw new Error('Progression non trouvée');
  }

  // Récupération des anciennes valeurs
  const oldClassrooms = progression.classrooms.map(String);
  const oldTeachers = progression.teachers.map(String);
  const oldWeekNumbers = progression.weekNumbers;

  // Mise à jour des champs principaux
  progression.title = title || progression.title;
  progression.classrooms = classrooms;
  progression.teachers = Array.isArray(teachers) ? teachers : [];
  progression.weekNumbers = weekNumbers;

  // Nettoyage des anciens formateurs dans les anciennes classes
  await Classroom.updateMany(
    { _id: { $in: oldClassrooms } },
    { $pull: { assignedTeachers: { $in: oldTeachers } } }
  );

  // Ajout des nouveaux formateurs dans les nouvelles classes (si fournis)
  if (teachers?.length) {
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

  // Nettoyage des anciennes affectations dans User
  await User.updateMany(
    { _id: { $in: oldTeachers } },
    {
      $pull: {
        assignedClassrooms: { $in: oldClassrooms },
        assignedProgressions: id,
      },
    }
  );

  // Mise à jour des services existants
  const oldServices = progression.services || [];
  const oldServiceWeeks = oldServices.map((s) => s.weekNumber);
  const newServiceWeeks = weekNumbers;

  // Suppression des services à retirer
  const weeksToRemove = oldServiceWeeks.filter((week) => !newServiceWeeks.includes(week));
  if (weeksToRemove.length > 0) {
    await Service.deleteMany({
      _id: oldServices
        .filter((s) => weeksToRemove.includes(s.weekNumber))
        .map((s) => s.service),
    });
    progression.services = progression.services.filter((s) => !weeksToRemove.includes(s.weekNumber));
  }

  // Ajout des nouveaux services
  const weeksToAdd = newServiceWeeks.filter((week) => !oldServiceWeeks.includes(week));
  for (const week of weeksToAdd) {
    const newService = await Service.create({
      weekNumber: week,
      classrooms,
      teachers: teachers || [],
    });

    progression.services.push({
      weekNumber: week,
      service: newService._id,
    });
  }
  // Mettre à jour les services existants avec les nouveaux teachers/classrooms
  await Service.updateMany(
    { _id: { $in: progression.services.map(s => s.service) } },
    {
      $set: {
        teachers: teachers || [],
        classrooms: classrooms || []
      }
    }
  )
  await progression.save();

  const updatedProgression = await Progression.findById(progression._id)
    .populate('teachers', 'firstname lastname email specialization')
    .populate('classrooms', 'name'); // Ajoute aussi classrooms si besoin

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
    .lean();

  if (!progression) {
    res.status(404);
    throw new Error("Progression non trouvée");
  }

  res.status(200).json(progression);
});

// @desc    Obtenir toutes les progressions
// @route   GET /api/progressions
// @access  Admin, Manager
const getAllProgressions = asyncHandler(async (req, res) => {
  const progressions = await Progression.find()
    .populate({
      path: 'classrooms',
      // Pas besoin de select si tu veux tous les champs, sinon sélectionne ceux utiles
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
    .lean();

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
    .lean();

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