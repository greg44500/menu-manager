const jwt = require('jsonwebtoken');
const SessionModel = require('../models/session.model');
const UserModel = require('../models/user.model');
const MenuModel = require('../models/menu.model');
const ServiceModel = require('../models/service.model');

/**
 * @desc    Authentifie l'utilisateur à partir du JWT stocké en cookie
 * @usage   Toutes les routes privées
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await SessionModel.findById(decoded.sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session invalide"
      });
    }
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    req.user = {
      id: decoded.userId,
      role: user.role
    };

    req.session = session;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token invalide"
    });
  }
};

/**
 * @desc    Autorise uniquement certains rôles à accéder à la route
 * @param   {Array} allowedRoles
 * @usage   Ex: authorizeRoles(["superAdmin", "manager"])
 */
exports.authorizeRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Vous n'avez pas les autorisations nécessaires"
        });
      }
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur de vérification des autorisations"
      });
    }
  };
};

/**
 * @desc    Autorise uniquement le superAdmin à supprimer un menu
 * @usage   DELETE /api/menus/:id
 */
exports.onlySuperAdmin = (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return res.status(403).json({
      success: false,
      message: "Seul un superAdmin peut supprimer un menu"
    });
  }
  next();
};

/**
 * @desc    Autorise uniquement un manager ou superAdmin à modifier un menu (paramètres sensibles)
 * @usage   PUT /api/menus/:id (modification des paramètres du menu)
 */
exports.onlyManagerOrSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superAdmin" && req.user.role !== "manager") {
    return res.status(403).json({
      success: false,
      message: "Seuls un manager ou un superAdmin peuvent modifier ce menu"
    });
  }
  next();
};

/**
 * @desc    Vérifie l'accès à une ressource basée sur les droits : 
 *          - admin/manager (accès total), 
 *          - co-auteur (présent dans authors[])
 * @param   {Mongoose.Model} model
 * @usage   PUT/DELETE sur items, menus...
 */
exports.checkResourceAccess = (model) => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Ressource non trouvée"
        });
      }

      switch (user.role) {
        case 'superAdmin':
        case 'manager':
          return next(); // Accès total
        case 'user':
          // Co-auteur (nouveau modèle)
          if (
            resource.authors &&
            Array.isArray(resource.authors) &&
            resource.authors.map(a => a.toString()).includes(user.id)
          ) {
            return next();
          }
          // Mono-auteur (rétrocompatibilité)
          if (
            resource.author &&
            resource.author.toString() === user.id
          ) {
            return next();
          }
          break;
      }
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Erreur de vérification des droits"
      });
    }
  };
};

/**
 * @desc    Autorise l'ajout/suppression d'items dans un menu à :
 *          - users assignés/remplaçants au service du menu,
 *          - co-auteurs du menu,
 *          - manager/superAdmin
 * @usage   PATCH /api/menus/:id/items, DELETE /api/menus/:id/items/:itemId
 */
exports.canEditMenuItems = async (req, res, next) => {
  try {
    const menuId = req.params.id;
    const menu = await MenuModel.findById(menuId).populate('service');
    if (!menu) {
      return res.status(404).json({ success: false, message: "Menu non trouvé" });
    }
    const userId = req.user.id;
    const service = menu.service;
    // Logique d'assignation/remplaçant à adapter selon ton modèle Service
    // Exemple générique (change 'teachers' et 'replacements' si besoin) :
    const isAssigned = service.teachers?.map(t => t.toString()).includes(userId);
    const isReplacement = service.replacements?.map(t => t.toString()).includes(userId);
    const isCoAuthor = menu.authors?.map(a => a.toString()).includes(userId);
    const isManagerOrAdmin = ["manager", "superAdmin"].includes(req.user.role);
    if (isAssigned || isReplacement || isCoAuthor || isManagerOrAdmin) {
      return next();
    }
    return res.status(403).json({ success: false, message: "Non autorisé à modifier les items de ce menu" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la vérification des droits sur le menu" });
  }
};
