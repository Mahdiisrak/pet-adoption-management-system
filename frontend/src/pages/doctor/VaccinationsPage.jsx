import { useEffect, useState } from "react";
import api from "../../services/api";

function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVaccinations = async () => {
      try {
        const response = await api.get("/doctor/vaccinations");
        setVaccinations(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load vaccinations"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVaccinations();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading vaccinations...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Vaccinations</h2>
          <p className="text-secondary mb-0">
            Vaccination records for pets treated by the logged-in doctor.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {vaccinations.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Vaccination ID</th>
                <th>Pet</th>
                <th>Vaccine</th>
                <th>Vaccination Date</th>
                <th>Next Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {vaccinations.map((item) => (
                <tr key={item.VACCINATION_ID}>
                  <td className="fw-semibold">
                    {item.VACCINATION_ID}
                  </td>

                  <td>
                    {item.PET_NAME || "-"}
                    <div className="small text-secondary">
                      {item.PET_ID}
                    </div>
                  </td>

                  <td>{item.VACCINE_NAME}</td>
                  <td>{formatDate(item.VACCINATION_DATE)}</td>
                  <td>{formatDate(item.NEXT_DUE_DATE)}</td>

                  <td>
                    <span className="badge bg-success-subtle text-success">
                      {item.VACCINATION_STATUS || "-"}
                    </span>
                  </td>
                </tr>
              ))}

              {vaccinations.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-secondary py-4"
                  >
                    No vaccination records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default VaccinationsPage;