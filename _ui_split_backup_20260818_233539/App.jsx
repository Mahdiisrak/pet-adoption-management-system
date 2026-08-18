import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import PersonsPage from "./pages/admin/PersonsPage";
import StaffPage from "./pages/admin/StaffPage";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import AddEmployeePage from "./pages/supervisor/AddEmployeePage";
import LocalPetsPage from "./pages/supervisor/LocalPetsPage";
import GuestPetsPage from "./pages/supervisor/GuestPetsPage";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import MedicalRecordsPage from "./pages/doctor/MedicalRecordsPage";
import VaccinationsPage from "./pages/doctor/VaccinationsPage";
import MedicinesPage from "./pages/doctor/MedicinesPage";
import PrescriptionsPage from "./pages/doctor/PrescriptionsPage";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdoptersPage from "./pages/employee/AdoptersPage";
import AdoptionsPage from "./pages/employee/AdoptionsPage";
import OwnersPage from "./pages/employee/OwnersPage";
import EmergencyContactsPage from "./pages/employee/EmergencyContactsPage";

import SupervisorOperationsPage from "./pages/supervisor/SupervisorOperationsPage";
import DoctorOperationsPage from "./pages/doctor/DoctorOperationsPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/persons" element={<PersonsPage />} />
          <Route path="/admin/staff" element={<StaffPage />} />
          <Route path="/admin/pets" element={<HomePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["SUPERVISOR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/operations" element={<SupervisorOperationsPage />} />
          <Route
            path="/supervisor/employees/add"
            element={<AddEmployeePage />}
          />
      <Route path="/supervisor/local-pets" element={<LocalPetsPage />} />
      <Route path="/supervisor/guest-pets" element={<GuestPetsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/operations" element={<DoctorOperationsPage />} />
          <Route path="/doctor/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/doctor/vaccinations" element={<VaccinationsPage />} />
          <Route path="/doctor/medicines" element={<MedicinesPage />} />
          <Route path="/doctor/prescriptions" element={<PrescriptionsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/pets" element={<HomePage />} />
          <Route path="/employee/adopters" element={<AdoptersPage />} />
          <Route path="/employee/adoptions" element={<AdoptionsPage />} />
          <Route path="/employee/owners" element={<OwnersPage />} />
          <Route
            path="/employee/contacts"
            element={<EmergencyContactsPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

