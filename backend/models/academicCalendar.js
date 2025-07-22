const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  startYear: {
    type: Number,
    required: true,
  },
  endYear: {
    type: Number,
    required: true,
  },
  startWeek: {
    type: Number,
    required: true,
    default: 35,
  },
  endWeek: {
    type: Number,
  },
  holidays: [
    {
      label: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    }
  ],
  events: [
    {
      title: { type: String, required: true },
      date: { type: Date, required: true },
      description: String
    }
  ],
  active: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
