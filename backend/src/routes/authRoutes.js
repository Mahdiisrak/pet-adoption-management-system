const createController = require('../controllers/authController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authenticate} = deps;
  const controller = createController(deps);

  app.post('/api/auth/login',safe(controller.login));
  app.post('/api/auth/switch-role',authenticate,safe(controller.switchRole));
  app.post('/api/auth/register',safe(controller.register));
};
