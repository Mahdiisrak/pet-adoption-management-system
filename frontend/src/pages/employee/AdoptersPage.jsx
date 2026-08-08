import { useEffect, useState } from "react";
import api from "../../services/api";

function AdoptersPage() {
  const [adopters, setAdopters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdopters = async () => {
      try {
        const response = await api.get("/employee/adopters");
        setAdopters(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load adopters"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdopters();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading adopters...</p>
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
          <h2 className="fw-bold mb-1">Adopters</h2>
          <p className="text-secondary mb-0">
            Registered adopter information from the Oracle database.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {adopters.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Adopter ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
              </tr>
            </thead>

            <tbody>
              {adopters.map((adopter) => (
                <tr key={adopter.ADOPTER_ID}>
                  <td className="fw-semibold">
                    {adopter.ADOPTER_ID}
                  </td>
                  <td>{adopter.NAME}</td>
                  <td>{adopter.PHONE_NO || "-"}</td>
                  <td>{adopter.EMAIL || "-"}</td>
                  <td>{adopter.ADDRESS || "-"}</td>
                </tr>
              ))}

              {adopters.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-secondary py-4"
                  >
                    No adopter records found.
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

export default AdoptersPage;
