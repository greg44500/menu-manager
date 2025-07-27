const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  startDate: { // Lundi de rentrée
    type: Date,
    required: true,
  },
  endDate: {   // Lundi du début vacances
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  holidays: [
    {
      name: String,
      start: Date,
      end: Date,
    }
  ],
  events: [
    {
      name: String,
      date: Date,
      description: String,
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('AcademicCalendar', calendarSchema);
