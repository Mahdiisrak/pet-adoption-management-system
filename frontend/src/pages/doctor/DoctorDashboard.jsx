import { useEffect, useState } from "react";
import api from "../../services/api";

function DoctorDashboard() {
  const [stats, setStats] = useState({
    medicalRecords: 0,
    vaccinations: 0,
    medicines: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/doctor/dashboard");
        setStats(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load doctor dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading doctor dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold">Doctor Dashboard</h2>
        <p className="text-secondary">
          Manage medical records, vaccinations and medicines.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-secondary">Medical Records</h6>
              <h1 className="fw-bold text-primary">
                {stats.medicalRecords}
              </h1>
              <p className="mb-0">Total patient records</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-secondary">Vaccinations</h6>
              <h1 className="fw-bold text-success">
                {stats.vaccinations}
              </h1>
              <p className="mb-0">Vaccination records</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-secondary">Medicines</h6>
              <h1 className="fw-bold text-warning">
                {stats.medicines}
              </h1>
              <p className="mb-0">Available medicines</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorDashboard;