import { useEffect, useState } from "react";
import api from "../../services/api";

function LocalPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get("/supervisor/local-pets");
        setPets(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load local pets"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading local pets...</p>
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
          <h2 className="fw-bold mb-1">Local Pets</h2>
          <p className="text-secondary mb-0">
            Local pets currently registered in the system.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {pets.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Pet ID</th>
                <th>Name</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Intake Date</th>
                <th>Adoption Status</th>
              </tr>
            </thead>

            <tbody>
              {pets.map((pet) => (
                <tr key={pet.LOCAL_PET_ID}>
                  <td className="fw-semibold">
                    {pet.LOCAL_PET_ID}
                  </td>

                  <td>{pet.PET_NAME || "-"}</td>
                  <td>{pet.SPECIES || "-"}</td>
                  <td>{pet.BREED || "-"}</td>
                  <td>{formatDate(pet.INTAKE_DATE)}</td>

                  <td>
                    <span className="badge bg-info-subtle text-info">
                      {pet.ADOPTION_STATUS || "-"}
                    </span>
                  </td>
                </tr>
              ))}

              {pets.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-secondary py-4"
                  >
                    No local pet records found.
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

export default LocalPetsPage;