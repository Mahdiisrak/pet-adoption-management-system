const createController = require('../controllers/userController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,managementRoles} = deps;
  const controller = createController(deps);

  app.get('/api/users',authorize('ADMIN'),safe(controller.listSupervisorUsers));
  app.post('/api/users',authorize('ADMIN'),safe(controller.createSupervisorUser));
  app.put('/api/users/:userId/status',authorize('ADMIN'),safe(controller.updateSupervisorUserStatus));
  app.get('/api/admin/employees',authorize('ADMIN'),safe(controller.listAdminEmployees));
  app.put('/api/admin/employees/:personId/layoff',authorize('ADMIN'),safe(controller.layoffEmployee));
  app.get('/api/roles',managementRoles,safe(controller.listRoles));
  app.post('/api/roles',authorize('SUPERVISOR'),safe(controller.createRole));
  app.delete('/api/roles/:role/:personId',authorize('SUPERVISOR'),safe(controller.deleteRole));
};
