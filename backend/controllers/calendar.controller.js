const asyncHandler = require('express-async-handler');
const AcademicCalendar = require('../models/calendar.model.js');

// @desc    Créer un calendrier académique
// @route   POST /api/calendars
// @access  Private (SuperAdmin/Manager)
const createCalendar = asyncHandler(async (req, res) => {
  const { label, startDate, endDate, active, holidays, events } = req.body;

  // Validation minimale : label, startDate, endDate requis
  if (!label || !startDate || !endDate) {
    res.status(400);
    throw new Error("Le nom, la date de début et la date de fin sont obligatoires");
  }

  // Vérifie qu'il n'existe pas déjà un calendrier avec ce label
  const exists = await AcademicCalendar.findOne({ label });
  if (exists) {
    res.status(409);
    throw new Error("Un calendrier avec ce nom existe déjà");
  }

  // Création
  const calendar = await AcademicCalendar.create({
    label,
    startDate,
    endDate,
    active: !!active,
    holidays: holidays || [],
    events: events || [],
    createdBy: req.user.id
  });

  res.status(201).json({ message: "Calendrier créé", data: calendar });
});

// @desc    Récupérer tous les calendriers
// @route   GET /api/calendars
// @access  Public
const getAllCalendars = asyncHandler(async (req, res) => {
  const calendars = await AcademicCalendar.find().sort({ startDate: -1 });
  res.status(200).json({ data: calendars });
});

// @desc    Mettre à jour un calendrier
// @route   PUT /api/calendars/:id
// @access  Private (SuperAdmin/Manager)
const updateCalendar = asyncHandler(async (req, res) => {
  const { label, startDate, endDate, active, holidays, events } = req.body;

  const calendar = await AcademicCalendar.findByIdAndUpdate(
    req.params.id,
    {
      label,
      startDate,
      endDate,
      active: !!active,
      holidays: holidays || [],
      events: events || [],
    },
    { new: true }
  );

  if (!calendar) {
    res.status(404);
    throw new Error("Calendrier introuvable");
  }
  res.status(200).json({ message: "Calendrier mis à jour", data: calendar });
});

// @desc    Supprimer un calendrier
// @route   DELETE /api/calendars/:id
// @access  Private (SuperAdmin/Manager)
const deleteCalendar = asyncHandler(async (req, res) => {
  const calendar = await AcademicCalendar.findByIdAndDelete(req.params.id);
  if (!calendar) {
    res.status(404);
    throw new Error("Calendrier introuvable");
  }
  res.status(200).json({ message: "Calendrier supprimé" });
});

module.exports = {
  createCalendar,
  getAllCalendars,
  updateCalendar,
  deleteCalendar
};
