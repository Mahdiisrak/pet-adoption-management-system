import { useEffect, useState } from "react";
import api from "../../services/api";

function OwnersPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOwners = async () => {
      try {
        const response = await api.get("/employee/owners");
        setOwners(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load owners"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOwners();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading owners...</p>
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
          <h2 className="fw-bold mb-1">Owners</h2>
          <p className="text-secondary mb-0">
            Registered owners and their current guest pets.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {owners.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Owner ID</th>
                <th>Name</th>
                <th>Occupation</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th style={{ minWidth: "260px" }}>
                  Current Guest Pet/Pets
                </th>
              </tr>
            </thead>

            <tbody>
              {owners.map((owner) => (
                <tr key={owner.OWNER_ID}>
                  <td className="fw-semibold">
                    {owner.OWNER_ID}
                  </td>

                  <td>{owner.NAME}</td>

                  <td>
                    <span className="badge bg-primary-subtle text-primary">
                      {owner.OCCUPATION || "-"}
                    </span>
                  </td>

                  <td>{owner.PHONE_NO || "-"}</td>
                  <td>{owner.EMAIL || "-"}</td>
                  <td>{owner.ADDRESS || "-"}</td>

                  <td>
                    {owner.CURRENT_GUEST_PETS?.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {owner.CURRENT_GUEST_PETS.map((pet) => (
                          <div
                            key={pet.GUEST_PET_ID}
                            className="border rounded-3 p-2 bg-light"
                          >
                            <div className="fw-semibold">
                              {pet.PET_NAME || "Unnamed Pet"}
                              <span className="text-secondary ms-2">
                                ({pet.GUEST_PET_ID})
                              </span>
                            </div>

                            <div className="small text-secondary">
                              {pet.SPECIES || "-"} · {pet.BREED || "-"}
                            </div>

                            <div className="small mt-1">
                              Checked in: {formatDate(pet.CHECK_IN_DATE)}
                            </div>

                            <span className="badge bg-success-subtle text-success mt-2">
                              {pet.GUEST_STATUS}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-secondary">
                        No current guest pet
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {owners.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-secondary py-4"
                  >
                    No owner records found.
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

export default OwnersPage;
