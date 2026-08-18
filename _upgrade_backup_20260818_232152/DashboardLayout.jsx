import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const roleMenus = {
  Admin: [
    { label: "Dashboard", path: "/admin", icon: "bi-speedometer2" },
    { label: "Persons", path: "/admin/persons", icon: "bi-people" },
    { label: "Staff", path: "/admin/staff", icon: "bi-person-badge" },
    { label: "Pets", path: "/admin/pets", icon: "bi-heart" },
    { label: "Adoptions", path: "/admin/adoptions", icon: "bi-house-heart" },
    { label: "Rescues", path: "/admin/rescues", icon: "bi-life-preserver" },
    { label: "Medical", path: "/admin/medical", icon: "bi-heart-pulse" },
    { label: "Finance", path: "/admin/finance", icon: "bi-cash-stack" },
    { label: "Shelters", path: "/admin/shelters", icon: "bi-building" },
    { label: "Reports", path: "/admin/reports", icon: "bi-bar-chart" },
  ],
  Supervisor: [
    { label: "Dashboard", path: "/supervisor", icon: "bi-speedometer2" },
    { label: "Add Employee", path: "/supervisor/employees/add", icon: "bi-person-plus" },
    { label: "Shelters", path: "/supervisor/shelters", icon: "bi-building" },
    { label: "Assignments", path: "/supervisor/assignments", icon: "bi-diagram-3" },
    { label: "Local Pets", path: "/supervisor/local-pets", icon: "bi-heart" },
    { label: "Guest Pets", path: "/supervisor/guest-pets", icon: "bi-box-arrow-in-right" },
    { label: "Rescues", path: "/supervisor/rescues", icon: "bi-life-preserver" },
    { label: "Volunteers", path: "/supervisor/volunteers", icon: "bi-people" },
  ],
  Doctor: [
    { label: "Dashboard", path: "/doctor", icon: "bi-speedometer2" },
    { label: "Medical Records", path: "/doctor/medical-records", icon: "bi-journal-medical" },
    { label: "Vaccinations", path: "/doctor/vaccinations", icon: "bi-shield-plus" },
    { label: "Medicines", path: "/doctor/medicines", icon: "bi-capsule" },
    { label: "Prescriptions", path: "/doctor/prescriptions", icon: "bi-file-medical" },
  ],
  Employee: [
    { label: "Dashboard", path: "/employee", icon: "bi-speedometer2" },
    { label: "Pets", path: "/employee/pets", icon: "bi-heart" },
    { label: "Adopters", path: "/employee/adopters", icon: "bi-person-check" },
    { label: "Adoptions", path: "/employee/adoptions", icon: "bi-house-heart" },
    { label: "Owners", path: "/employee/owners", icon: "bi-person-vcard" },
    { label: "Emergency Contacts", path: "/employee/contacts", icon: "bi-telephone" },
  ],
};

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedRole = localStorage.getItem("selectedRole") || "Admin";

  const roleFromPath =
    location.pathname.startsWith("/supervisor")
      ? "Supervisor"
      : location.pathname.startsWith("/doctor")
        ? "Doctor"
        : location.pathname.startsWith("/employee")
          ? "Employee"
          : "Admin";

  const currentRole = storedRole === roleFromPath ? storedRole : roleFromPath;
  const menuItems = roleMenus[currentRole] || roleMenus.Admin;

  const savedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");

    navigate("/", { replace: true });
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside
        className="bg-dark text-white d-flex flex-column p-3"
        style={{ width: "270px", minHeight: "100vh" }}
      >
        <div className="d-flex align-items-center gap-3 mb-4 px-2">
          <div
            className="bg-primary rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: "46px", height: "46px" }}
          >
            <i className="bi bi-heart-fill fs-4"></i>
          </div>

          <div>
            <h5 className="mb-0 fw-bold">PetCare</h5>
            <small className="text-white-50">{currentRole} Panel</small>
          </div>
        </div>

        <nav className="nav nav-pills flex-column gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${currentRole.toLowerCase()}`}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 ${
                  isActive ? "active" : "text-white-50"
                }`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <button
            type="button"
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>
            Logout
          </button>
        </div>
      </aside>

      <section className="flex-grow-1">
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">{currentRole} Dashboard</h5>
            <small className="text-secondary">
              Pet Adoption and Management System
            </small>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">
                {currentUser?.name || currentUser?.username || `${currentRole} User`}
              </div>
              <small className="text-secondary">
                {currentRole} access
              </small>
            </div>

            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "42px", height: "42px" }}
            >
              <i className="bi bi-person-fill"></i>
            </div>
          </div>
        </header>

        <div className="p-4">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default DashboardLayout;



