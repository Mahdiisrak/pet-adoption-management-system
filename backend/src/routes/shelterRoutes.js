const createController = require('../controllers/shelterController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,staffRoles} = deps;
  const controller = createController(deps);

  app.get('/api/shelters',staffRoles,safe(controller.listShelters));
  app.get('/api/shelters/supervisors',authorize('ADMIN'),safe(controller.listShelterSupervisors));
  app.post('/api/shelters',authorize('ADMIN'),safe(controller.createShelter));
  app.put('/api/shelters/:shelterId/supervisor',authorize('ADMIN'),safe(controller.assignShelterSupervisor));
};
