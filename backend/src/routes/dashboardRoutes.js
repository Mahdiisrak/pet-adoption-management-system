const createController = require('../controllers/dashboardController');

module.exports = function registerRoutes(app, deps) {
  const {safe} = deps;
  const controller = createController(deps);

  app.get('/api/dashboard',safe(controller.getDashboard));
};
