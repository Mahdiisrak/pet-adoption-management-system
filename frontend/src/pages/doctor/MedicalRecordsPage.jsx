import { useEffect, useState } from "react";
import api from "../../services/api";

function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await api.get("/doctor/medical-records");
        setRecords(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load medical records"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading medical records...</p>
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
          <h2 className="fw-bold mb-1">Medical Records</h2>
          <p className="text-secondary mb-0">
            Medical records handled by the logged-in doctor.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {records.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Record ID</th>
                <th>Pet</th>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Health Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.RECORD_ID}>
                  <td className="fw-semibold">
                    {record.RECORD_ID}
                  </td>

                  <td>
                    {record.PET_NAME || "-"}
                    <div className="small text-secondary">
                      {record.PET_ID}
                    </div>
                  </td>

                  <td>
                    {record.RECORD_DATE
                      ? new Date(record.RECORD_DATE).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>{record.DIAGNOSIS || "-"}</td>
                  <td>{record.TREATMENT || "-"}</td>
                  <td>{record.HEALTH_STATUS || "-"}</td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-secondary py-4"
                  >
                    No medical records found.
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

export default MedicalRecordsPage;
