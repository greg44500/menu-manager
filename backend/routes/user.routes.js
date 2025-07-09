const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

const { 
    getUserProfile, 
    updatePassword, 
    requestPasswordReset, 
    resetPassword,  
    getAllUsers,
    getUserById, 
    updateUser,
    deleteUser 
} = require('../controllers/user.controllers');

const sendReminderEmails = require('../utils/sendReminderMails');

// ================================
// ROUTES SPÉCIFIQUES EN PREMIER
// ================================

// Profil utilisateur connecté
router.get('/profile', authenticateUser, getUserProfile);

// Routes reset password (SANS auth - normal pour reset)
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/send-password-reminders", sendReminderEmails);

// Changement de mot de passe
router.patch('/password/:id', authenticateUser, updatePassword);

// ================================
// ROUTES CRUD AVEC AUTHENTIFICATION
// ================================

// ✅ AUTHENTIFICATION REMISE : Récupérer tous les utilisateurs
router.get('/', authenticateUser, authorizeRoles(['superAdmin', 'manager']), getAllUsers);

// ✅ AUTHENTIFICATION REMISE : CRUD complet
router.get('/:id', authenticateUser, authorizeRoles(['superAdmin', 'manager']), getUserById);
router.put('/:id', authenticateUser, authorizeRoles(['superAdmin', 'manager']), updateUser);
router.delete('/:id', authenticateUser, authorizeRoles(['superAdmin']), deleteUser);

module.exports = router;