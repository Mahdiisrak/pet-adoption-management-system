const createController = require('../controllers/petController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/pets',safe(controller.listPets));
  app.get('/api/owners',authorize('ADMIN','SUPERVISOR','EMPLOYEE'),safe(controller.listOwners));
  app.get('/api/my-owned-pets',authorize('OWNER'),safe(controller.listMyOwnedPets));
  app.post('/api/pets',authorize('ADMIN','EMPLOYEE'),safe(controller.createPet));
};
