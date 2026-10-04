import { useEffect, useState } from "react";
import api from "../../services/api";

function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const response = await api.get("/doctor/prescriptions");
        setPrescriptions(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load prescriptions"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading prescriptions...</p>
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
          <h2 className="fw-bold mb-1">Prescriptions</h2>
          <p className="text-secondary mb-0">
            Medicines prescribed for pets under your medical records.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {prescriptions.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Record ID</th>
                <th>Pet</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>

            <tbody>
              {prescriptions.map((item) => (
                <tr key={`${item.RECORD_ID}-${item.MEDICINE_ID}`}>
                  <td className="fw-semibold">
                    {item.RECORD_ID}
                  </td>

                  <td>
                    {item.PET_NAME || "-"}
                    <div className="small text-secondary">
                      {item.PET_ID || "-"}
                    </div>
                  </td>

                  <td>
                    {item.MEDICINE_NAME || "-"}
                    <div className="small text-secondary">
                      {item.MEDICINE_ID}
                    </div>
                  </td>

                  <td>{item.DOSAGE || "-"}</td>
                  <td>{item.FREQUENCY || "-"}</td>

                  <td>
                    {item.DURATION_DAYS != null
                      ? `${item.DURATION_DAYS} days`
                      : "-"}
                  </td>

                  <td>{item.INSTRUCTIONS || "-"}</td>
                </tr>
              ))}

              {prescriptions.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-secondary py-4"
                  >
                    No prescription records found.
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

export default PrescriptionsPage;