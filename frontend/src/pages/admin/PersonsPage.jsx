import { useEffect, useState } from "react";
import api from "../../services/api";

function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPersons = async () => {
      try {
        const response = await api.get("/admin/persons");
        setPersons(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load persons"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPersons();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading persons...</p>
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
          <h2 className="fw-bold mb-1">Persons</h2>
          <p className="text-secondary mb-0">
            All person records from the Oracle database.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {persons.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Person ID</th>
                <th>First Name</th><th>Last Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Gender</th>
                <th>Date of Birth</th>
              </tr>
            </thead>

            <tbody>
              {persons.map((person) => (
                <tr key={person.PERSON_ID}>
                  <td className="fw-semibold">
                    {person.PERSON_ID}
                  </td>
                  <td>{person.FIRST_NAME || "-"}</td><td>{person.LAST_NAME || "-"}</td>
                  <td>{person.PHONE_NO || "-"}</td>
                  <td>{person.EMAIL || "-"}</td>
                  <td>{person.ADDRESS || "-"}</td>
                  <td>{person.GENDER || "-"}</td>
                  <td>
                    {person.DATE_OF_BIRTH
                      ? new Date(
                          person.DATE_OF_BIRTH
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {persons.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-secondary py-4"
                  >
                    No person records found.
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

export default PersonsPage;
