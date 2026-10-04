const createController = require('../controllers/salaryController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,managementRoles} = deps;
  const controller = createController(deps);

  app.get('/api/salaries',managementRoles,safe(controller.listSalaries));
  app.get('/api/salaries/payees',authorize('SUPERVISOR'),safe(controller.listSalaryPayees));
  app.post('/api/salaries',authorize('SUPERVISOR'),safe(controller.createSalary));
};
