const createController = require('../controllers/adoptionController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/adoptions',authorize('ADMIN','SUPERVISOR','EMPLOYEE','ADOPTER'),safe(controller.listAdoptions));
  app.get('/api/adoptions/available-pets',authorize('ADOPTER'),safe(controller.listAvailablePets));
  app.get('/api/adoptions/employees',authorize('SUPERVISOR'),safe(controller.listAssignableEmployees));
  app.post('/api/adoptions',authorize('ADOPTER'),safe(controller.submitAdoption));
  app.put('/api/adoptions/:adoptionId/review',authorize('SUPERVISOR'),safe(controller.reviewAdoption));
  app.put('/api/adoptions/:adoptionId/adopt',authorize('EMPLOYEE'),safe(controller.finalizeAdoption));
};
