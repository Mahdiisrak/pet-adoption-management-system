const createController = require('../controllers/plsqlController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,managementRoles} = deps;
  const controller = createController(deps);

  app.get('/api/query-lab',managementRoles,safe(controller.listQueryLabItems));
  app.get('/api/query-lab/:key',managementRoles,safe(controller.runQueryLabItem));
  app.get('/api/plsql/function/:personId',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(controller.runStoredFunctionDemo));
  app.get('/api/plsql/cursor',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(controller.runCursorDemo));
  app.get('/api/plsql/exception/:personId',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(controller.runExceptionDemo));
};
