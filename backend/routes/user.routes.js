const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

const { getUserProfile, updatePassword, requestPasswordReset, resetPassword,  getAllUsers,
    getUserById, 
    updateUser,
    deleteUser } = require('../controllers/user.controllers');
const sendReminderEmails = require('../utils/sendReminderMails');
// Main User Profile Info Routes
router.get('/profile', authenticateUser, getUserProfile);
router.patch('/password/:id', authenticateUser, updatePassword);
// router.get('/logout', authenticateUser, logout); //authenticateUser


//** REQUEST AND RESET PASSWORD */
// Route pour demander la réinitialisation du mot de passe
router.post("/request-password-reset", requestPasswordReset);

// Route pour réinitialiser le mot de passe avec le token
router.post("/reset-password", resetPassword);

// Route pour rappeler le changement de mot de passe temporaire
router.post("/send-password-reminders", sendReminderEmails);
module.exports = router

//** REQUEST ROUTES USER */
// Récupérer tous les utilisateurs (superAdmin/manager uniquement)
router.get('/', authenticateUser, authorizeRoles(['superAdmin', 'manager']), getAllUsers);

// Récupérer un utilisateur spécifique (superAdmin/manager uniquement)
router.get('/:id', authenticateUser, authorizeRoles(['superAdmin', 'manager']), getUserById);

// Mettre à jour un utilisateur (superAdmin/manager uniquement)
router.put('/:id', authenticateUser, authorizeRoles(['superAdmin', 'manager']), updateUser);

// Supprimer un utilisateur (superAdmin uniquement)
router.delete('/:id', authenticateUser, authorizeRoles(['superAdmin']), deleteUser);