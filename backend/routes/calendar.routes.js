const express = require('express');
const router = express.Router();
const {
    createCalendar,
    getAllCalendars,
    updateCalendar,
    deleteCalendar
} = require('../controllers/calendar.controller');
const { authenticateUser, authorizeRoles } = require('../middlewares/auth.middlewares');

router.route('/')
    // GET all calendars (accessible à tous)
    .get(getAllCalendars)
    // POST new calendar (manager & superAdmin only)
    .post(createCalendar);// Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 

router.route('/:id')
    // PUT update calendar (manager & superAdmin only)
    .put(updateCalendar) // Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 
    // DELETE calendar (manager & superAdmin only)
    .delete(deleteCalendar);// Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 

module.exports = router;
