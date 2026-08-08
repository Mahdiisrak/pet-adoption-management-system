import { useEffect, useState } from "react";
import api from "../../services/api";

function AdoptionsPage() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdoptions = async () => {
      try {
        const response = await api.get("/employee/adoptions");
        setAdoptions(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load adoption information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdoptions();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading adoptions...</p>
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
          <h2 className="fw-bold mb-1">Adoptions</h2>
          <p className="text-secondary mb-0">
            Adoption process records from the Oracle database.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {adoptions.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Adoption ID</th>
                <th>Adopter</th>
                <th>Pet</th>
                <th>Employee ID</th>
                <th>Application Date</th>
                <th>Completion Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {adoptions.map((adoption) => (
                <tr key={adoption.ADOPTION_ID}>
                  <td className="fw-semibold">
                    {adoption.ADOPTION_ID}
                  </td>

                  <td>
                    {adoption.ADOPTER_NAME}
                    <div className="small text-secondary">
                      {adoption.ADOPTER_ID}
                    </div>
                  </td>

                  <td>
                    {adoption.PET_NAME}
                    <div className="small text-secondary">
                      {adoption.PET_ID}
                    </div>
                  </td>

                  <td>{adoption.EMPLOYEE_ID}</td>

                  <td>
                    {adoption.APPLICATION_DATE
                      ? new Date(
                          adoption.APPLICATION_DATE
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {adoption.COMPLETION_DATE
                      ? new Date(
                          adoption.COMPLETION_DATE
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span className="badge bg-primary-subtle text-primary">
                      {adoption.ADOPTION_STATUS}
                    </span>
                  </td>
                </tr>
              ))}

              {adoptions.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-secondary py-4"
                  >
                    No adoption records found.
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

export default AdoptionsPage;

