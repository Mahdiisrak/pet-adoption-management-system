param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
Write-Host "Project root: $ProjectRoot" -ForegroundColor Cyan

$required = @(
  "frontend\src\App.jsx",
  "frontend\src\layouts\DashboardLayout.jsx",
  "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx"
)

foreach ($rel in $required) {
  $full = Join-Path $ProjectRoot $rel
  if (-not (Test-Path $full)) {
    throw "Required file not found: $full"
  }
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $ProjectRoot "_ui_split_backup_$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

Copy-Item (Join-Path $ProjectRoot "frontend\src\App.jsx") $backup
Copy-Item (Join-Path $ProjectRoot "frontend\src\layouts\DashboardLayout.jsx") $backup
Copy-Item (Join-Path $ProjectRoot "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx") $backup

Write-Host "Backup created: $backup" -ForegroundColor DarkGray

$utf8 = New-Object System.Text.UTF8Encoding($false)

# -------------------------------------------------------------------
# 1) Create separate Add Doctor page
# -------------------------------------------------------------------
$addDoctorPage = @'
import { useState } from "react";
import api from "../../services/api";

export default function AddDoctorPage() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const response = await api.post("/supervisor/doctors", data);
      setMessage(response.data.message || "Doctor created successfully");
      e.currentTarget.reset();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Add Doctor</h2>
        <p className="text-secondary mb-0">
          Create a doctor profile and doctor login account.
        </p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Person ID</label>
                <input name="personId" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">User ID</label>
                <input name="userId" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">First Name</label>
                <input name="firstName" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Last Name</label>
                <input name="lastName" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" defaultValue="">
                  <option value="">Select</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input name="phoneNo" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Address</label>
                <input name="address" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input name="dateOfBirth" type="date" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Hire Date</label>
                <input name="hireDate" type="date" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">License No</label>
                <input name="licenseNo" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Specialization</label>
                <input name="specialization" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Salary</label>
                <input name="salary" type="number" min="0" step="0.01" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Username</label>
                <input name="username" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Password</label>
                <input name="password" type="password" minLength="6" className="form-control" required />
              </div>
            </div>

            <button className="btn btn-primary mt-4" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Doctor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
'@

$doctorPagePath = Join-Path $ProjectRoot "frontend\src\pages\supervisor\AddDoctorPage.jsx"
[System.IO.File]::WriteAllText($doctorPagePath, $addDoctorPage, $utf8)

# -------------------------------------------------------------------
# 2) Create separate Add Volunteer page
# -------------------------------------------------------------------
$addVolunteerPage = @'
import { useState } from "react";
import api from "../../services/api";

export default function AddVolunteerPage() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const response = await api.post("/supervisor/volunteers", data);
      setMessage(response.data.message || "Volunteer created successfully");
      e.currentTarget.reset();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Add Volunteer</h2>
        <p className="text-secondary mb-0">
          Register a volunteer and save availability and skills.
        </p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Person ID</label>
                <input name="personId" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">First Name</label>
                <input name="firstName" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Last Name</label>
                <input name="lastName" className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" defaultValue="">
                  <option value="">Select</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input name="phoneNo" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Address</label>
                <input name="address" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input name="dateOfBirth" type="date" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Join Date</label>
                <input name="joinDate" type="date" className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Availability</label>
                <select name="availability" className="form-select" defaultValue="AVAILABLE">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="ON_DUTY">ON_DUTY</option>
                </select>
              </div>

              <div className="col-md-8">
                <label className="form-label">Skills</label>
                <input
                  name="skills"
                  className="form-control"
                  placeholder="Example: Animal handling, rescue support"
                />
              </div>
            </div>

            <button className="btn btn-primary mt-4" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Volunteer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
'@

$volunteerPagePath = Join-Path $ProjectRoot "frontend\src\pages\supervisor\AddVolunteerPage.jsx"
[System.IO.File]::WriteAllText($volunteerPagePath, $addVolunteerPage, $utf8)

# -------------------------------------------------------------------
# 3) Replace Operations page so it only contains management operations
# -------------------------------------------------------------------
$managementPage = @'
import { useState } from "react";
import api from "../../services/api";

function Fields({ names }) {
  return names.map((f) => (
    <div className="col-md-4" key={f.name}>
      <label className="form-label">{f.label}</label>
      {f.type === "select" ? (
        <select
          className="form-select"
          name={f.name}
          defaultValue={f.defaultValue || ""}
          required={f.required}
        >
          <option value="">Select</option>
          {f.options.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      ) : (
        <input
          className="form-control"
          name={f.name}
          type={f.type || "text"}
          required={f.required}
          defaultValue={f.defaultValue || ""}
        />
      )}
    </div>
  ));
}

function FormCard({ title, fields, button, onSubmit }) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <Fields names={fields} />
          </div>

          <button className="btn btn-primary mt-3" type="submit">
            {button}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SupervisorOperationsPage() {
  const [message, setMessage] = useState("");
  const [viewRows, setViewRows] = useState([]);
  const [viewName, setViewName] = useState("");

  const post = (url) => async (e) => {
    e.preventDefault();

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const response = await api.post(url, data);

      setMessage(response.data.message || "Saved");
      e.currentTarget.reset();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    }
  };

  const updateStatus = async (e) => {
    e.preventDefault();

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());

      const response = await api.patch(
        `/supervisor/status/${data.entity}/${data.id}`,
        { status: data.status }
      );

      setMessage(response.data.message || "Status updated");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    }
  };

  const loadView = async (name) => {
    try {
      const response = await api.get(`/supervisor/views/${name}`);

      setViewRows(response.data.data || []);
      setViewName(name);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Management & Views</h2>
        <p className="text-secondary mb-0">
          SQL views, salary payment, medicine expense and status management.
        </p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold">SQL Views</h5>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => loadView("persons")}
            >
              View All Persons
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => loadView("staff")}
            >
              View All Staff
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => loadView("salaries")}
            >
              View Salary History
            </button>
          </div>

          {viewRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead>
                  <tr>
                    {Object.keys(viewRows[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {viewRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, columnIndex) => (
                        <td key={columnIndex}>
                          {value == null ? "-" : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewName && !viewRows.length && (
            <div className="text-secondary">
              No rows in {viewName} view.
            </div>
          )}
        </div>
      </div>

      <FormCard
        title="Record Salary Payment"
        button="Record Salary"
        onSubmit={post("/supervisor/salary-payments")}
        fields={[
          {
            name: "receiverType",
            label: "Receiver Type",
            type: "select",
            options: ["EMPLOYEE", "SUPERVISOR", "DOCTOR"],
            required: true,
          },
          {
            name: "receiverId",
            label: "Receiver ID",
            required: true,
          },
          {
            name: "amount",
            label: "Amount",
            type: "number",
            required: true,
          },
          {
            name: "salaryDate",
            label: "Payment Date",
            type: "date",
          },
        ]}
      />

      <FormCard
        title="Record Medicine Expense"
        button="Record Expense"
        onSubmit={post("/supervisor/medicine-expenses")}
        fields={[
          {
            name: "medicineId",
            label: "Medicine ID",
            required: true,
          },
          {
            name: "amount",
            label: "Expense Amount",
            type: "number",
            required: true,
          },
          {
            name: "quantity",
            label: "Purchased Quantity",
            type: "number",
          },
          {
            name: "expenseDate",
            label: "Expense Date",
            type: "date",
          },
          {
            name: "description",
            label: "Description",
          },
        ]}
      />

      <FormCard
        title="Update Status"
        button="Update Status"
        onSubmit={updateStatus}
        fields={[
          {
            name: "entity",
            label: "Entity",
            type: "select",
            options: [
              "PET",
              "EMPLOYEE",
              "VOLUNTEER",
              "LOCAL_PET",
              "GUEST_PET",
              "SHELTER",
              "ADOPTION",
              "RESCUE",
              "SALARY",
              "ADOPTER",
              "SYSTEM_USER",
            ],
            required: true,
          },
          {
            name: "id",
            label: "Record ID",
            required: true,
          },
          {
            name: "status",
            label: "New Status",
            required: true,
          },
        ]}
      />
    </div>
  );
}
'@

$operationsPath = Join-Path $ProjectRoot "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx"
[System.IO.File]::WriteAllText($operationsPath, $managementPage, $utf8)

# -------------------------------------------------------------------
# 4) Add imports and routes to App.jsx
# -------------------------------------------------------------------
$appPath = Join-Path $ProjectRoot "frontend\src\App.jsx"
$app = [System.IO.File]::ReadAllText($appPath)

$doctorImport = 'import AddDoctorPage from "./pages/supervisor/AddDoctorPage";'
$volunteerImport = 'import AddVolunteerPage from "./pages/supervisor/AddVolunteerPage";'

foreach ($importLine in @($doctorImport, $volunteerImport)) {
  if ($app -notmatch [regex]::Escape($importLine)) {
    $functionIndex = $app.IndexOf("function App()")

    if ($functionIndex -lt 0) {
      throw "Could not find function App() in frontend/src/App.jsx"
    }

    $app = $app.Insert(
      $functionIndex,
      $importLine + [Environment]::NewLine
    )
  }
}

$doctorRoute = '<Route path="/supervisor/add-doctor" element={<AddDoctorPage />} />'
$volunteerRoute = '<Route path="/supervisor/add-volunteer" element={<AddVolunteerPage />} />'

if ($app -notmatch [regex]::Escape($doctorRoute)) {
  $marker = '<Route path="/supervisor/operations" element={<SupervisorOperationsPage />} />'

  if (-not $app.Contains($marker)) {
    throw "Supervisor operations route not found in App.jsx"
  }

  $replacement =
    $marker +
    [Environment]::NewLine +
    "          " +
    $doctorRoute +
    [Environment]::NewLine +
    "          " +
    $volunteerRoute

  $app = $app.Replace($marker, $replacement)
}

[System.IO.File]::WriteAllText($appPath, $app, $utf8)

# -------------------------------------------------------------------
# 5) Reorganize Supervisor sidebar
# -------------------------------------------------------------------
$layoutPath = Join-Path $ProjectRoot "frontend\src\layouts\DashboardLayout.jsx"
$layout = [System.IO.File]::ReadAllText($layoutPath)

# Rename old menu item if it exists
$layout = $layout.Replace(
  '{ label: "Operations & Views", path: "/supervisor/operations", icon: "bi-tools" },',
  '{ label: "Management & Views", path: "/supervisor/operations", icon: "bi-tools" },'
)

# Also support a slightly different existing label
$layout = $layout.Replace(
  '{ label: "Supervisor Operations", path: "/supervisor/operations", icon: "bi-tools" },',
  '{ label: "Management & Views", path: "/supervisor/operations", icon: "bi-tools" },'
)

$addDoctorMenu =
  '{ label: "Add Doctor", path: "/supervisor/add-doctor", icon: "bi-person-plus" },'

$addVolunteerMenu =
  '{ label: "Add Volunteer", path: "/supervisor/add-volunteer", icon: "bi-person-heart" },'

if ($layout -notmatch [regex]::Escape($addDoctorMenu)) {

  # Best placement: immediately after existing Add Employee item.
  $employeePattern =
    '(\{\s*label:\s*"Add Employee"\s*,\s*path:\s*"[^"]+"[^\r\n]*\r?\n)'

  if ($layout -match $employeePattern) {
    $newMenus =
      '$1' +
      $addDoctorMenu +
      [Environment]::NewLine +
      $addVolunteerMenu +
      [Environment]::NewLine

    $layout = [regex]::Replace(
      $layout,
      $employeePattern,
      $newMenus,
      1
    )
  }
  else {
    # Fallback: put them after Supervisor Dashboard.
    $dashboardPattern =
      '(\{\s*label:\s*"Dashboard"\s*,\s*path:\s*"/supervisor"[^\r\n]*\r?\n)'

    if ($layout -notmatch $dashboardPattern) {
      throw "Could not locate Supervisor Dashboard or Add Employee menu item in DashboardLayout.jsx"
    }

    $newMenus =
      '$1' +
      $addDoctorMenu +
      [Environment]::NewLine +
      $addVolunteerMenu +
      [Environment]::NewLine

    $layout = [regex]::Replace(
      $layout,
      $dashboardPattern,
      $newMenus,
      1
    )
  }
}

# If Management & Views is still above staff creation entries, move it after Add Volunteer.
$managementLine =
  '{ label: "Management & Views", path: "/supervisor/operations", icon: "bi-tools" },'

$layoutWithoutManagement = $layout.Replace(
  $managementLine + [Environment]::NewLine,
  ""
)

if ($layoutWithoutManagement -eq $layout) {
  $layoutWithoutManagement = $layout.Replace($managementLine, "")
}

$layout = $layoutWithoutManagement

$volunteerMenuPattern =
  '(\{\s*label:\s*"Add Volunteer"\s*,\s*path:\s*"/supervisor/add-volunteer"[^\r\n]*\r?\n)'

if ($layout -match $volunteerMenuPattern) {
  $layout = [regex]::Replace(
    $layout,
    $volunteerMenuPattern,
    '$1' + $managementLine + [Environment]::NewLine,
    1
  )
}
else {
  throw "Could not position Management & Views after Add Volunteer"
}

[System.IO.File]::WriteAllText($layoutPath, $layout, $utf8)

# -------------------------------------------------------------------
# 6) Build check
# -------------------------------------------------------------------
Write-Host "Building frontend..." -ForegroundColor Cyan

Push-Location (Join-Path $ProjectRoot "frontend")

try {
  & npm.cmd run build

  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed. Restore from: $backup"
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "SUPERVISOR UI SPLIT COMPLETE" -ForegroundColor Green
Write-Host "Created: /supervisor/add-doctor" -ForegroundColor Green
Write-Host "Created: /supervisor/add-volunteer" -ForegroundColor Green
Write-Host "Kept:    /supervisor/operations as Management & Views" -ForegroundColor Green
Write-Host "Backend/database APIs were not changed." -ForegroundColor Green
Write-Host "Backup: $backup" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next: refresh the browser and test all three Supervisor pages." -ForegroundColor Cyan
