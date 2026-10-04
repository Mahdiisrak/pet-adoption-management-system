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