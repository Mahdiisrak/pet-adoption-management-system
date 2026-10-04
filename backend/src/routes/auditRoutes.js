const createController = require('../controllers/auditController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/activity-log',authorize('ADMIN'),safe(controller.listActivityLog));
};
