const createController = require('../controllers/personController');

module.exports = function registerRoutes(app, deps) {
  const {safe} = deps;
  const controller = createController(deps);

  app.get('/api/profile',safe(controller.getProfile));
  app.put('/api/auth/change-password',safe(controller.changePassword));
};
