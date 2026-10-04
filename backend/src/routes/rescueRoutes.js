const createController = require('../controllers/rescueController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/rescues/shelters',authorize('VOLUNTEER'),safe(controller.listShelters));
  app.get('/api/rescues/intake',authorize('SUPERVISOR'),safe(controller.listIntakeQueue));
  app.post('/api/rescues/:rescueId/pets',authorize('SUPERVISOR'),safe(controller.registerRescuePet));
  app.put('/api/rescues/:rescueId/complete-intake',authorize('SUPERVISOR'),safe(controller.completeIntake));
  app.get('/api/rescues',authorize('ADMIN','SUPERVISOR','VOLUNTEER'),safe(controller.listRescues));
  app.post('/api/rescues',authorize('VOLUNTEER'),safe(controller.createRescue));
};
