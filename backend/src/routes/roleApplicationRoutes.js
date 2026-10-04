const createController = require('../controllers/roleApplicationController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/role-applications',safe(controller.listRoleApplications));
  app.post('/api/role-applications',safe(controller.createRoleApplication));
  app.put('/api/role-applications/:applicationId/review',authorize('ADMIN','SUPERVISOR','EMPLOYEE'),safe(controller.reviewRoleApplication));
};
