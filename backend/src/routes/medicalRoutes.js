const createController = require('../controllers/medicalController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize,careRoles} = deps;
  const controller = createController(deps);

  app.get('/api/medical',careRoles,safe(controller.listMedicalRecords));
  app.post('/api/medical',authorize('EMPLOYEE','DOCTOR'),safe(controller.createMedicalRecord));
  app.get('/api/medicines',careRoles,safe(controller.listMedicines));
  app.post('/api/medicines',authorize('EMPLOYEE','DOCTOR'),safe(controller.createMedicine));
  app.get('/api/vaccinations',careRoles,safe(controller.listVaccinations));
  app.post('/api/vaccinations',authorize('EMPLOYEE','DOCTOR'),safe(controller.createVaccination));
};
