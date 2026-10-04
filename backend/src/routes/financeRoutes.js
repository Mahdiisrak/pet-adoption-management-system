const createController = require('../controllers/financeController');

module.exports = function registerRoutes(app, deps) {
  const {safe,authorize} = deps;
  const controller = createController(deps);

  app.get('/api/finance',authorize('ADMIN'),safe(controller.getFinance));
  app.get('/api/donations',authorize('ADMIN','DONOR'),safe(controller.listDonations));
  app.post('/api/donations',authorize('DONOR'),safe(controller.createDonation));
  app.post('/api/income',authorize('SUPERVISOR'),safe(controller.createIncome));
  app.post('/api/expenses',authorize('SUPERVISOR'),safe(controller.createExpense));
};
