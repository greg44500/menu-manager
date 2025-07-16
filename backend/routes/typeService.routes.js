const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
   createTypeService,
    updateTypeService,
    getOneTypeService,
    getAllTypeServices,
    deleteOneTypeService,
    deleteAllTypeServices
} = require('../controllers/typeService.controller');

// Main routes for SERVICE Type
router.route("/")
    .post(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), createTypeService) //CREATE ONE
    .get(authenticateUser, getAllTypeServices) // GET ALL
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleteAllTypeServices) // DELETE ALL
        
router.route("/:id")
    .put(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), updateTypeService) // UPDATE ONE
    .get(authenticateUser, getOneTypeService) // GET ONE
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleteOneTypeService) // DELETE ONE

module.exports = router