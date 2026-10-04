import { useState } from "react";
import api from "../../services/api";

const initialForm = {
  personId: "",
  userId: "",
  firstName: "",
  lastName: "",
  phoneNo: "",
  email: "",
  address: "",
  gender: "",
  dateOfBirth: "",
  hireDate: "",
  jobTitle: "",
  employmentStatus: "ACTIVE",
  username: "",
  password: "",
};

function AddEmployeePage() {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post(
        "/supervisor/employees",
        formData
      );

      setMessage(response.data.message);
      setFormData(initialForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to create employee"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Add Employee</h2>
        <p className="text-secondary mb-0">
          Create person, employee and login account records together.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <h5 className="fw-bold mb-3">Personal Information</h5>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Person ID *</label>
                <input
                  type="text"
                  name="personId"
                  className="form-control"
                  value={formData.personId}
                  onChange={handleChange}
                  placeholder="P007"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phoneNo"
                  className="form-control"
                  value={formData.phoneNo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h5 className="fw-bold mb-3">Employment Information</h5>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Hire Date *</label>
                <input
                  type="date"
                  name="hireDate"
                  className="form-control"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  className="form-control"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Pet Care Employee"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Employment Status</label>
                <select
                  name="employmentStatus"
                  className="form-select"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <h5 className="fw-bold mb-3">Login Account</h5>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">User ID *</label>
                <input
                  type="text"
                  name="userId"
                  className="form-control"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="U005"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Create Employee
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddEmployeePage;
