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