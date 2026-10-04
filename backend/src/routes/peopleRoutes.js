const createController = require('../controllers/peopleController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,staffRoles} = deps;
  const controller = createController(deps);

  app.get('/api/people',staffRoles,safe(controller.listPeople));
  app.post('/api/people',authorize('SUPERVISOR'),safe(controller.createPerson));
  app.put('/api/people/:personId',authorize('ADMIN'),safe(controller.updatePerson));
  app.get('/api/emergency',safe(controller.listEmergencyContacts));
  app.post('/api/emergency',safe(controller.createEmergencyContact));
  app.put('/api/emergency/:currentName',safe(controller.updateEmergencyContact));
  app.delete('/api/emergency/:eName',safe(controller.deleteEmergencyContact));
};
