const asyncHandler = require('express-async-handler');
const AcademicCalendar = require('../models/academicCalendar.model');

// @desc    Créer un calendrier académique
// @route   POST /api/calendars
// @access  Private (SuperAdmin/Manager)
const createCalendar = asyncHandler(async (req, res) => {
  const calendar = await AcademicCalendar.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ message: "Calendrier créé", data: calendar });
});

// @desc    Récupérer tous les calendriers
// @route   GET /api/calendars
// @access  Public
const getAllCalendars = asyncHandler(async (req, res) => {
  const calendars = await AcademicCalendar.find().sort({ startYear: -1 });
  res.status(200).json({ data: calendars });
});

// @desc    Mettre à jour un calendrier
// @route   PUT /api/calendars/:id
// @access  Private (SuperAdmin/Manager)
const updateCalendar = asyncHandler(async (req, res) => {
  const calendar = await AcademicCalendar.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
